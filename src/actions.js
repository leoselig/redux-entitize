// @flow

import { UPDATE_ENTITY, UPDATE_ENTITIES, DELETE_ENTITY } from "./actionTypes";

export type UpdateEntityActionType = {
  type: "redux-entitize/UPDATE_ENTITY",
  payload: {
    data: Object,
    schema: string
  }
};
export function updateEntityAction(
  schema: string,
  data: Object
): UpdateEntityActionType {
  return {
    type: UPDATE_ENTITY,
    payload: {
      schema,
      data
    }
  };
}

export type UpdateEntitiesActionType = {
  type: "redux-entitize/UPDATE_ENTITIES",
  payload: {
    data: Object[],
    schema: string
  }
};
export function updateEntitiesAction(
  schema: string,
  data: Object[]
): UpdateEntitiesActionType {
  return {
    type: UPDATE_ENTITIES,
    payload: {
      schema,
      data
    }
  };
}

export type DeleteEntityActionType = {
  type: "redux-entitize/DELETE_ENTITY",
  payload: {
    id: string,
    schema: string
  }
};
export function deleteEntityAction(
  schema: string,
  id: string
): DeleteEntityActionType {
  return {
    type: DELETE_ENTITY,
    payload: {
      schema,
      id
    }
  };
}
