// @flow

import createEntitiesReducer, { type StateType } from "./reducer";
import { updateEntityAction, type UpdateEntityActionType } from "./actions";
import { selectEntity, selectEntities } from "./selectors";

export {
  createEntitiesReducer,
  updateEntityAction,
  selectEntity,
  selectEntities
};
export type { StateType, UpdateEntityActionType };
