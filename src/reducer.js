// @flow

import omit from "lodash/omit";
import deepExtend from "deep-extend";
import { normalize } from "normalizr";

import type { SchemaMapType, StateType, SchemaReferencesType } from "./types";
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
          schemaEntities: {
            ...state.schemaEntities,
            [nextSchema.key]: {}
          }
        }),
        {
          schemaReferences: getReferencesForSchema(schemas),
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

  return deepExtend({}, state, { schemaEntities: entities });
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

    Object.keys(referencingSchema.schema).forEach(viaField => {
      const {
        referencedSchemaName,
        relationType
      } = getReferencedSchemaNameForField(referencingSchema, viaField);

      if (!schemaReferences[referencingSchemaName]) {
        schemaReferences[referencingSchemaName] = [];
      }

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
