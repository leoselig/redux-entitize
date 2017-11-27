// @flow

import without from "lodash/without";
import difference from "lodash/difference";

import type {
  StateType,
  SchemaReferencesType,
  ReferencesToType,
  SchemaReferenceType,
  EntityReferenceType,
  SchemaEntitiesMapType
} from "../types";
import {
  addReference,
  deleteReference,
  getReferencesTo
} from "../referenceTracker";

// This module provides helpers to update the references between entities when they get added,
// changed or deleted
// This is not a reducer – just a collection of methods implementing the data structure updates

export function updateReferencesForUpdatedEntities(
  state: StateType,
  updatedEntities: { [schema: string]: SchemaEntitiesMapType }
): ReferencesToType {
  return Object.keys(state.schemaReferences).reduce(
    (currentReferencesTo, schemaName) =>
      updateReferencesForAllEntitiesOfSingleSchema(
        schemaName,
        state.schemaReferences,
        state.schemaReferences[schemaName],
        state.entityReferences,
        currentReferencesTo,
        updatedEntities[schemaName] || {},
        state.schemaEntities[schemaName]
      ),
    state.entityReferences
  );
}

function updateReferencesForAllEntitiesOfSingleSchema(
  schemaName,
  allSchemaReferences,
  schemaReferences,
  previousEntityReferences,
  nextEntityReferences,
  updatedSchemaEntities,
  previousSchemaEntities
) {
  return Object.keys(updatedSchemaEntities).reduce(
    (currentReferencesTo, referencingEntityId) =>
      updateReferencesForSingleEntity(
        allSchemaReferences,
        currentReferencesTo,
        schemaName,
        updatedSchemaEntities[referencingEntityId],
        previousSchemaEntities[referencingEntityId] || {
          id: referencingEntityId
        }
      ),
    previousEntityReferences
  );
}

function updateReferencesForSingleEntity(
  schemaReferences: SchemaReferencesType,
  previousReferencesTo: ReferencesToType,
  updatedEntitySchemaName: string,
  nextEntityData: { id: string },
  previousEntityData: { id: string }
): ReferencesToType {
  return schemaReferences[updatedEntitySchemaName].reduce(
    (currentReferencesTo, schemaReference) =>
      updateReferencesForSingleEntityForSingleSchemaReference(
        schemaReference,
        currentReferencesTo,
        updatedEntitySchemaName,
        nextEntityData,
        previousEntityData
      ),
    previousReferencesTo
  );
}

function updateReferencesForSingleEntityForSingleSchemaReference(
  schemaReference: SchemaReferenceType,
  previousReferencesTo: ReferencesToType,
  updatedEntitySchemaName: string,
  updatedEntityData: { id: string },
  previousEntityData: { id: string }
): ReferencesToType {
  const fromID = updatedEntityData.id;
  const nextReferencedIDs = getReferencedIds(
    updatedEntityData,
    schemaReference
  );
  const previousReferencedIDs = getReferencedIds(
    previousEntityData,
    schemaReference
  );

  const { viaField, toSchema, relationType } = schemaReference;

  const referencedIDsToBeAdded = difference(
    nextReferencedIDs,
    previousReferencedIDs
  );

  // Add references for all IDs that appeared
  const referencesWithAdded = referencedIDsToBeAdded.reduce(
    (currentReferencesTo, toId) =>
      addReference(
        currentReferencesTo,
        getReferenceID(updatedEntitySchemaName, fromID, viaField),
        getReferenceID(toSchema, toId),
        {
          fromSchema: updatedEntitySchemaName,
          fromID,
          viaField,
          relationType
        }
      ),
    previousReferencesTo
  );

  // Delete references for all IDs that disappeared
  const referencedIDsToBeDeleted = difference(
    previousReferencedIDs,
    nextReferencedIDs
  );

  return referencedIDsToBeDeleted.reduce(
    (currentReferencesTo, toId) =>
      deleteReference(
        currentReferencesTo,
        getReferenceID(updatedEntitySchemaName, fromID, viaField),
        getReferenceID(toSchema, toId)
      ),
    referencesWithAdded
  );
}

function getReferencedIds(entity, schemaReference) {
  const { relationType, viaField } = schemaReference;
  const fieldValue = entity[viaField];

  if (!fieldValue) {
    return [];
  }

  return (relationType === "one" ? [fieldValue] : fieldValue) || [];
}

function getReferenceID(fromSchema, fromID, viaField) {
  const partWithoutField = `${fromSchema}#${fromID}`;

  return viaField ? `${partWithoutField}.${viaField}` : partWithoutField;
}

export function updateReferencesForDeletedEntity(
  state: StateType,
  deletedSchemaName: string,
  deletedEntityId: string
) {
  const referencesToDeletedEntity = getReferencesTo(
    state.entityReferences,
    getReferenceID(deletedSchemaName, deletedEntityId)
  );

  return Object.keys(
    referencesToDeletedEntity
  ).reduce((toBeUpdatedEntities, referenceID) => {
    // $FlowFixMe We are the only one calling addReference() so we know we get the correct reference meta data back here
    const entityReference: EntityReferenceType =
      referencesToDeletedEntity[referenceID];
    const { fromSchema, fromID, viaField, relationType } = entityReference;

    const referencingEntity = state.schemaEntities[fromSchema][fromID];
    const newReferencesValue = relationType === "one"
      ? null
      : without(referencingEntity[viaField], deletedEntityId);

    return {
      ...toBeUpdatedEntities,
      [fromSchema]: {
        ...toBeUpdatedEntities[fromSchema],
        [fromID]: {
          ...referencingEntity,
          [viaField]: newReferencesValue
        }
      }
    };
  }, {});
}
