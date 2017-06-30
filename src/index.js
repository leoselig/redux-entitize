// @flow

import createEntitiesReducer, { type StateType } from "./reducer";
import { updateEntitiesAction, type UpdateEntitiesActionType } from "./actions";
import { selectEntity, selectEntities } from "./selectors";

export {
  createEntitiesReducer,
  updateEntitiesAction,
  selectEntity,
  selectEntities
};
export type { StateType, UpdateEntitiesActionType };
