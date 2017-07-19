// @flow

import createEntitiesReducer, { type StateType } from "./reducer";
import {
  updateEntityAction,
  updateEntitiesAction,
  deleteEntityAction,
  type UpdateEntityActionType,
  type UpdateEntitiesActionType,
  type DeleteEntityActionType
} from "./actions";
import createSelectors from "./createSelectors";

export {
  createEntitiesReducer,
  updateEntityAction,
  updateEntitiesAction,
  deleteEntityAction,
  createSelectors
};
export type {
  StateType,
  UpdateEntityActionType,
  UpdateEntitiesActionType,
  DeleteEntityActionType
};
