// @flow

import without from "lodash/without";
import difference from "lodash/difference";

import type {
  StateType,
  SchemaReferencesType,
  EntityReferencesType,
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
): EntityReferencesType {
  return Object.keys(state.schemaReferences).reduce(
    (currentReferencesTo, schemaName) =>
      updateReferencesForAllEntitiesOfSingleSchema(
        schemaName,
        state.schemaReferences,
        currentReferencesTo,
        updatedEntities[schemaName] || {},
        state.schemaEntities[schemaName]
      ),
    state.entityReferences
  );
}

function updateReferencesForAllEntitiesOfSingleSchema(
  schemaName,
  schemaReferences,
  entityReferencesBefore,
  schemaEntitiesUpdated,
  schemaEntitiesBefore
) {
  return Object.keys(schemaEntitiesUpdated).reduce(
    (entityReferencesCurrent, referencingEntityId) =>
      updateReferencesForSingleEntity(
        schemaReferences,
        entityReferencesCurrent,
        schemaName,
        schemaEntitiesUpdated[referencingEntityId],
        schemaEntitiesBefore[referencingEntityId] || {
          id: referencingEntityId
        }
      ),
    entityReferencesBefore
  );
}

function updateReferencesForSingleEntity(
  schemaReferences: SchemaReferencesType,
  entityReferencesBefore: EntityReferencesType,
  schemaNameOfEntity: string,
  entityDataUpdated: { id: string },
  entityDataBefore: { id: string }
): EntityReferencesType {
  return schemaReferences[schemaNameOfEntity].reduce(
    (entityReferencesCurrent, schemaReference) =>
      updateReferencesForSingleEntityForSingleSchemaReference(
        schemaReference,
        entityReferencesCurrent,
        schemaNameOfEntity,
        entityDataUpdated,
        entityDataBefore
      ),
    entityReferencesBefore
  );
}

function updateReferencesForSingleEntityForSingleSchemaReference(
  schemaReference: SchemaReferenceType,
  entityReferencesBefore: EntityReferencesType,
  schemaNameOfEntity: string,
  entityDataUpdated: { id: string },
  entityDataBefore: { id: string }
): EntityReferencesType {
  const fromID = entityDataUpdated.id;
  const nextReferencedIDs = getReferencedIds(
    entityDataUpdated,
    schemaReference
  );
  const previousReferencedIDs = getReferencedIds(
    entityDataBefore,
    schemaReference
  );

  const { viaField, toSchema, relationType } = schemaReference;

  const referencedIDsToBeAdded = difference(
    nextReferencedIDs,
    previousReferencedIDs
  );

  // Add references for all IDs that appeared
  const referencesWithAdded = referencedIDsToBeAdded.reduce(
    (entityReferencesCurrent, toID) =>
      addReference(
        entityReferencesCurrent,
        getReferenceID(schemaNameOfEntity, fromID, viaField),
        getReferenceID(toSchema, toID),
        {
          fromSchema: schemaNameOfEntity,
          fromID,
          viaField,
          relationType
        }
      ),
    entityReferencesBefore
  );

  // Delete references for all IDs that disappeared
  const referencedIDsToBeDeleted = difference(
    previousReferencedIDs,
    nextReferencedIDs
  );

  return referencedIDsToBeDeleted.reduce(
    (entityReferencesCurrent, toId) =>
      deleteReference(
        entityReferencesCurrent,
        getReferenceID(schemaNameOfEntity, fromID, viaField),
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
