// @flow

import createEntitiesReducer from "./reducer";
import {
  updateEntityAction,
  updateEntitiesAction,
  deleteEntityAction,
  type UpdateEntityActionType,
  type UpdateEntitiesActionType,
  type DeleteEntityActionType
} from "./actions";
import createSelectors from "./createSelectors";
import type {
  PropsWithIdType,
  PropsWithIdsType,
  StateType,
  SelectorsType,
  SchemaMapType
} from "./types";

export {
  createEntitiesReducer,
  updateEntityAction,
  updateEntitiesAction,
  deleteEntityAction,
  createSelectors
};
export type {
  UpdateEntityActionType,
  UpdateEntitiesActionType,
  DeleteEntityActionType,
  PropsWithIdType,
  PropsWithIdsType,
  StateType,
  SelectorsType,
  SchemaMapType
};
