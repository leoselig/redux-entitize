// @flow

import deepExtend from "deep-extend";
import { normalize, type Schema } from "normalizr";

import { type UpdateEntitiesActionType } from "./actions";

export type SchemaMapType = {
  [schemaName: string]: Schema
};

export type StateType = {
  [schema: string]: {
    [id: string]: Object
  }
};

function getInitialState(schemas: SchemaMapType): StateType {
  function intializeFromSchemas(schemas: SchemaMapType) {
    return Object.keys(schemas)
      .map(nextSchemaName => schemas[nextSchemaName])
      .reduce(
        (state, nextSchema) => ({
          ...state,
          [nextSchema._key]: {}
        }),
        {}
      );
  }

  return intializeFromSchemas(schemas);
}

export default function createEntitiesReducer(schemas: SchemaMapType) {
  function entitiesReducer(
    state: StateType = getInitialState(schemas),
    action: UpdateEntitiesActionType | Object
  ): StateType {
    switch (action.type) {
      case "redux-entities/UPDATE_ENTITIES":
        return updateEntities(state, action, schemas);
      default:
        return state;
    }
  }

  return entitiesReducer;
}

function updateEntities(
  state: StateType,
  action: UpdateEntitiesActionType,
  schemas: SchemaMapType
): StateType {
  const { data, schema } = action.payload;

  if (!data.id) {
    throw new Error(`No 'id'-field found in entitiy of schema '${schema}'`);
  }

  const { entities } = normalize(data, schemas[schema]);

  return deepExtend({}, state, entities);
}
