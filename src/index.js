// @flow

import createEntitiesReducer, { type StateType } from "./reducer";
import {
  updateEntityAction,
  updateEntitiesAction,
  type UpdateEntityActionType
} from "./actions";
import createSelectors from "./createSelectors";

export {
  createEntitiesReducer,
  updateEntityAction,
  updateEntitiesAction,
  createSelectors
};
export type { StateType, UpdateEntityActionType };
