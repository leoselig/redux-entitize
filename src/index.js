// @flow

import createEntitiesReducer, { type StateType } from "./reducer";
import {
  updateEntityAction,
  updateEntitiesAction,
  type UpdateEntityActionType
} from "./actions";
import { selectEntity, selectEntities } from "./selectors";

export {
  createEntitiesReducer,
  updateEntityAction,
  updateEntitiesAction,
  selectEntity,
  selectEntities
};
export type { StateType, UpdateEntityActionType };
