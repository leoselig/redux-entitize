// @flow

import deepExtend from "deep-extend";
import { normalize, type Schema } from "normalizr";

import { type UpdateEntityActionType } from "./actions";

export type SchemaMapType = {
  [schemaName: string]: Schema
};

export type EntityType = Object;

export type SchemaEntitiesMapType = {
  [id: string]: EntityType
};

export type StateType = {
  [schema: string]: SchemaEntitiesMapType
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
    action: UpdateEntityActionType | Object
  ): StateType {
    switch (action.type) {
      case "redux-entitize/UPDATE_ENTITY":
        return updateEntity(state, action, schemas);
      default:
        return state;
    }
  }

  return entitiesReducer;
}

function updateEntity(
  state: StateType,
  action: UpdateEntityActionType,
  schemas: SchemaMapType
): StateType {
  const { data, schema } = action.payload;

  if (!data.id) {
    throw new Error(`No 'id'-field found in entitiy of schema '${schema}'`);
  }

  const { entities } = normalize(data, schemas[schema]);

  return deepExtend({}, state, entities);
}
