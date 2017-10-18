// @flow

import omit from "lodash/omit";
import without from "lodash/without";
import deepExtend from "deep-extend";
import { normalize } from "normalizr";

import type {
  SchemaMapType,
  StateType,
  SchemaReferencesType,
  EntityReferencesBySchemaByIDType
} from "./types";
import {
  type UpdateEntityActionType,
  type UpdateEntitiesActionType,
  type DeleteEntityActionType
} from "./actions";
import { UPDATE_ENTITY, UPDATE_ENTITIES, DELETE_ENTITY } from "./actionTypes";

function getInitialState(schemas: SchemaMapType<*>): StateType {
  function intializeFromSchemas(schemas: SchemaMapType<*>) {
    return Object.keys(schemas)
      .map(nextSchemaName => schemas[nextSchemaName])
      .reduce(
        (state, nextSchema) => ({
          ...state,
          entityReferences: {
            ...state.entityReferences,
            [nextSchema.key]: {}
          },
          schemaEntities: {
            ...state.schemaEntities,
            [nextSchema.key]: {}
          }
        }),
        {
          schemaReferences: getReferencesForSchema(schemas),
          entityReferences: {},
          schemaEntities: {}
        }
      );
  }

  return intializeFromSchemas(schemas);
}

export default function createEntitiesReducer(schemas: SchemaMapType<*>) {
  function entitiesReducer(
    state: StateType = getInitialState(schemas),
    action: UpdateEntityActionType | Object
  ): StateType {
    switch (action.type) {
      case UPDATE_ENTITY:
        return handleUpdateEntity(state, action, schemas);
      case UPDATE_ENTITIES:
        return handleUpdateEntities(state, action, schemas);
      case DELETE_ENTITY:
        return handleDeleteEntity(state, action);
      default:
        return state;
    }
  }

  return entitiesReducer;
}

function updateEntity(
  state: StateType,
  data: Object,
  schema: string,
  schemas: SchemaMapType<*>
): StateType {
  if (!data.id) {
    throw new Error(`No 'id'-field found in entitiy of schema '${schema}'`);
  }

  const { entities } = normalize(data, schemas[schema]);

  return {
    ...state,
    schemaEntities: deepExtend({}, state.schemaEntities, entities),
    entityReferences: getNewEntityReferences(state, entities)
  };
}

function handleDeleteEntity(
  state: StateType,
  action: DeleteEntityActionType
): StateType {
  const { schema, id } = action.payload;

  return {
    ...state,
    schemaEntities: {
      ...state.schemaEntities,
      ...getUpdatedEntitiesForDeletion(state, schema, id),
      [schema]: omit(state[schema], id)
    }
  };
}

function handleUpdateEntity(
  state: StateType,
  action: UpdateEntityActionType,
  schemas: SchemaMapType<*>
): StateType {
  const { data, schema } = action.payload;

  return updateEntity(state, data, schema, schemas);
}

function handleUpdateEntities(
  state: StateType,
  action: UpdateEntitiesActionType,
  schemas: SchemaMapType<*>
): StateType {
  const { data, schema } = action.payload;

  return data.reduce(
    (currentState, entityData) =>
      updateEntity(currentState, entityData, schema, schemas),
    state
  );
}

function getReferencesForSchema(schemas): SchemaReferencesType {
  const schemaReferences = {};

  Object.keys(schemas).forEach(referencingSchemaName => {
    const referencingSchema = schemas[referencingSchemaName];

    schemaReferences[referencingSchemaName] = [];

    Object.keys(referencingSchema.schema).forEach(viaField => {
      const {
        referencedSchemaName,
        relationType
      } = getReferencedSchemaNameForField(referencingSchema, viaField);

      schemaReferences[referencingSchemaName].push({
        toSchema: referencedSchemaName,
        viaField,
        relationType
      });
    });
  });

  return schemaReferences;
}

function getReferencedSchemaNameForField(normalizrSchema, field: string) {
  const normalizrFieldValue = normalizrSchema.schema[field];
  const is1ToManyRelation = Array.isArray(normalizrFieldValue);

  return {
    relationType: is1ToManyRelation ? "many" : "one",
    referencedSchemaName: is1ToManyRelation
      ? normalizrSchema.schema[field][0].key
      : normalizrSchema.schema[field].key
  };
}

function getNewEntityReferences(
  state,
  updatedEntities
): EntityReferencesBySchemaByIDType {
  const entityReferences = {
    ...state.entityReferences
  };

  Object.keys(state.schemaReferences).forEach(referencingSchemaName => {
    getNewEntityReferencesForSchema(
      referencingSchemaName,
      state.schemaReferences[referencingSchemaName],
      state.entityReferences,
      entityReferences,
      updatedEntities[referencingSchemaName] || {},
      state.schemaEntities[referencingSchemaName]
    );
  });

  return entityReferences;
}

function getNewEntityReferencesForSchema(
  schemaName,
  schemaReferences,
  previousEntityReferences,
  nextEntityReferences,
  updatedSchemaEntities,
  previousSchemaEntities
) {
  Object.keys(updatedSchemaEntities).forEach(referencingEntityId => {
    const nextReferencingEntity = updatedSchemaEntities[referencingEntityId];
    const previousReferencingEntity =
      previousSchemaEntities[referencingEntityId] || {};

    schemaReferences.forEach(referenceOfCurrentSchema => {
      const { toSchema, viaField, relationType } = referenceOfCurrentSchema;
      const previousReferencedIds = getReferencedIds(
        previousReferencingEntity,
        referenceOfCurrentSchema
      );
      const nextReferencedIds = getReferencedIds(
        nextReferencingEntity,
        referenceOfCurrentSchema
      );
      const previousReferencesOfCurrentSchema =
        previousEntityReferences[toSchema] || {};
      const nextReferencesOfCurrentSchema = {};

      // If an entity referenced an ID in the current field before, but that ID is not contained in
      // updated entity anymore, it means that the reference is gone
      // When copying the old references into the new references, those are left out
      previousReferencedIds.forEach(previousReferencedId => {
        if (!nextReferencedIds.includes(previousReferencedId)) {
          return;
        }

        nextReferencesOfCurrentSchema[previousReferencedId] =
          previousReferencesOfCurrentSchema[previousReferencedId];
      });

      nextReferencedIds.forEach(referencedEntityId => {
        const previousReferencesOfEntity =
          previousReferencesOfCurrentSchema[referencedEntityId] || [];

        if (!nextReferencesOfCurrentSchema[referencedEntityId]) {
          nextReferencesOfCurrentSchema[
            referencedEntityId
          ] = previousReferencesOfEntity.filter(
            previousReferenceOfEntity =>
              previousReferenceOfEntity.id !== referencingEntityId
          );
        }

        const newReference = {
          field: viaField,
          id: referencingEntityId,
          relationType,
          toSchema: schemaName
        };

        // Imagine an entity is updated with the same references twice. Then, we will discover
        // the same references again. To avoid having duplicates, simply filter these out
        const isReferenceAlreadyKnown = !!nextReferencesOfCurrentSchema[
          referencedEntityId
        ].find(isEqualReference.bind(null, newReference));

        isReferenceAlreadyKnown ||
          nextReferencesOfCurrentSchema[referencedEntityId].push(newReference);
      });

      nextEntityReferences[toSchema] = nextReferencesOfCurrentSchema;
    });
  });
}

function getReferencedIds(entity, schemaReference) {
  const { relationType, viaField } = schemaReference;

  return (relationType === "one" ? [entity[viaField]] : entity[viaField]) || [];
}

function isEqualReference(reference1, reference2) {
  return (
    reference1.field === reference2.field &&
    reference1.id === reference2.id &&
    reference1.toSchema === reference2.toSchema
  );
}
