// @flow

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
    type: "redux-entitize/UPDATE_ENTITY",
    payload: {
      schema,
      data
    }
  };
}
