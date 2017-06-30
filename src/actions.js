// @flow

import { UPDATE_ENTITY, UPDATE_ENTITIES } from "./actionTypes";

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
