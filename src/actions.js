// @flow

export type UpdateEntitiesActionType = {
  type: "redux-entities/UPDATE_ENTITIES",
  payload: {
    data: Object,
    schema: string
  }
};
export function updateEntitiesAction(
  schema: string,
  data: Object
): UpdateEntitiesActionType {
  return {
    type: "redux-entities/UPDATE_ENTITIES",
    payload: {
      schema,
      data
    }
  };
}
