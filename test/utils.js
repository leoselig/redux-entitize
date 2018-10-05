// @flow

import {
  createStore,
  applyMiddleware,
  combineReducers,
  // See https://github.com/benmosher/eslint-plugin-import/issues/708
  type Reducer, // eslint-disable-line import/named
  type Store // eslint-disable-line import/named
} from "redux";

import type { StateWithEntitiesType } from "../src/types";

type SpyStoreType = Store<StateWithEntitiesType, *> & {
  getActions: () => Object[],
  replaceState: (newState: StateWithEntitiesType) => void
};

const STATE_REPLACE_ACTION_TYPE = "STATE_REPLACE_ACTION_TYPE";

function stateReplaceReducer(
  state: StateWithEntitiesType,
  { type, payload }: Object | { type: "STATE_REPLACE_ACTION_TYPE", payload: StateWithEntitiesType }
): StateWithEntitiesType {
  if (type === STATE_REPLACE_ACTION_TYPE) {
    return payload;
  }

  return state;
}

export function createSpyStore(
  reducers?: { [key: string]: Reducer<Object, *> } = {},
  middlewares?: Array<*> = []
): SpyStoreType {
  const actions = [];

  // combineReducers() complains without any reducer on the object so in that
  // case we just default to the identity function as a no-op
  const combinedReducers: Reducer<StateWithEntitiesType, *> =
    Object.keys(reducers).length > 0 ? combineReducers(reducers) : currentState => currentState;

  function mainReducer(currentState: StateWithEntitiesType, action): StateWithEntitiesType {
    const nextState: StateWithEntitiesType = combinedReducers(currentState, action);

    return stateReplaceReducer(nextState, action);
  }

  const { dispatch, ...store } = createStore(
    mainReducer,
    applyMiddleware(...middlewares, () => next => (action: Object) => {
      if (action.type !== STATE_REPLACE_ACTION_TYPE) {
        actions.push(action);
      }

      return next(action);
    })
  );

  return {
    ...store,
    dispatch: (dispatch: any), // eslint-disable-line flowtype/no-weak-types
    getActions() {
      return actions;
    },
    replaceState(newState) {
      dispatch({
        type: STATE_REPLACE_ACTION_TYPE,
        payload: newState
      });
    }
  };
}
