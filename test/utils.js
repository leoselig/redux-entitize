// @flow

import {
  createStore,
  applyMiddleware,
  combineReducers,
  type Reducer,
  type Store
} from "redux";

type SpyStoreType<State: Object> = Store<State, *> & {
  getActions: () => Object[],
  replaceState: (newState: State) => void
};

const STATE_REPLACE_ACTION_TYPE = "STATE_REPLACE_ACTION_TYPE";

function stateReplaceReducer<State: Object>(
  state: State,
  {
    type,
    payload
  }: Object | { type: "STATE_REPLACE_ACTION_TYPE", payload: State }
): State {
  if (type === STATE_REPLACE_ACTION_TYPE) {
    return payload;
  }

  return state;
}

export function createSpyStore<State: Object>(
  state: State,
  reducers?: { [key: string]: Reducer<State, *> } = {},
  middlewares?: Array<*> = []
): SpyStoreType<State> {
  const actions = [];

  // combineReducers() complains without any reducer on the object so in that
  // case we just default to the identity function as a no-op
  // $FlowFixMe: Not sure what goes wrong here
  const combinedReducers: Reducer<State, *> = Object.keys(reducers).length > 0
    ? combineReducers(reducers)
    : currentState => currentState;

  function mainReducer(currentState: State, action): State {
    const nextState: State = combinedReducers(currentState, action);

    return stateReplaceReducer(nextState, action);
  }

  const { dispatch, ...store } = createStore(
    mainReducer,
    state,
    applyMiddleware(...middlewares, () => next => (action: Object) => {
      if (action.type !== STATE_REPLACE_ACTION_TYPE) {
        actions.push(action);
      }

      return next(action);
    })
  );

  return {
    ...store,
    dispatch: (dispatch: any),
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
