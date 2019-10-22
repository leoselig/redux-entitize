// @flow

import {
  createStore,
  applyMiddleware,
  combineReducers,
  // See https://github.com/benmosher/eslint-plugin-import/issues/708
  type Reducer, // eslint-disable-line import/named
  type Store // eslint-disable-line import/named
} from "redux";

import type { AnyEntityActionType } from "../src/actions";
import type { StateWithEntitiesType, StateType } from "../src/types";

type SpyStoreType = {
  ...Store<StateWithEntitiesType, any>,
  getActions: () => Object[]
};

export function createSpyStore(
  entitiesReducer: Reducer<StateType, AnyEntityActionType>,
  middlewares?: Array<*> = []
): SpyStoreType {
  const actions = [];

  // combineReducers() complains without any reducer on the object so in that
  // case we just default to the identity function as a no-op
  const combinedReducers = combineReducers({ entities: entitiesReducer });

  const { dispatch, ...store } = createStore(
    combinedReducers,
    applyMiddleware(...middlewares, () => next => (action: Object) => {
      actions.push(action);

      return next(action);
    })
  );

  return {
    ...store,
    dispatch: (dispatch: any), // eslint-disable-line flowtype/no-weak-types
    getActions() {
      return actions;
    }
  };
}
