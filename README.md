# redux-entitize

Automated [redux](https://github.com/reactjs/redux)-state management for all your entities.

`redux-entitize` helps you organize all your entities in unified and normalized state. It ships with:

- a reducer
- a set of action creators to populate your state with entity data
- a set of selectors to retrieve entities from the state

## Install

```bash
yarn add redux-entitize
# or
npm install --save redux-entitize
```

## Getting Started

### 1. Define your schemas

You need to tell redux-entitize about all your [normalizr](https://github.com/paularmstrong/normalizr)-schemas by defining a **`schemaMap`**:

```javascript
// schemaMap.js

import { normalize, schema } from 'normalizr';

const userSchema = new schema.Entity('users');
const commentSchema = new schema.Entity('comments', {
  commenter: userSchema
});

export const schemaMap = {
  users: userSchema,
  comments: commentSchema,
};
```

### 2. Add the `entities`-reducer

```javascript
// reducers.js

import { createEntitiesReducer } from 'redux-entitize';
import { combineReducers } from 'redux';
import { schemaMap } from './schemasMap';

const entitiesReducer = createEntitiesReducer(schemas);

export const reducers = combineReducers({
  entities: entitiesReducer // must be called entities
  // ... your other reducers
});
```

**Note:** In order for the [selectors](#selectors) to Just Work™, the state slice must be called `entities`.

### Dispatch update actions

To add new entities or update existing ones, use `updateEntityAction` / `updateEntitiesAction`.

To remove an entity from your state, use `deleteEntityAction`.

```javascript
// main.js

import { createStore } from 'redux';
import {
  updateEntityAction,
  updateEntitiesAction,
  deleteEntityAction,
} from 'redux-entitize';

import { reducers } from './reducers';

const store = createStore(reducers);

store.dispatch(
  updateEntityAction('users', {
    id: "1234",
    email: "test.user@example.com",
    age: 25,
  })
);

store.dispatch(
  updateEntitiesAction('comments', [{
    id: "567",
    message: "Hello world.",
    commenter: "1234",
  }, {
    id: "890",
    message: "Yet another comment. Even by the same commenter",
    commenter: "1234",
  }])
);

store.dispatch(
  deleteEntityAction('comments', "567");
);
```

**Note:** Where these actions are actually dispatched is dependent on how your app is interacting with the API.

### Select entities from state

`redux-entitize` provides a selectors factory to simplify selecting entities from the state. It's strongly recommended to use these, because
- selected entities will be automatically **de-normalized**
- selectors are based on [reselect](https://github.com/reactjs/reselect), so they are memoized (otherwise you application will most likely be slow)
- selectors are meant to remain stable throughout changes of the internal `entities`-state

```javascript
// selectors.js

import { createSelectors } from 'redux-entitize';

// Assuming we have that `schemas` variable from above when you created your schemas
import { schemaMap } from './schemaMap'

export const selectors = createSelectors(schemas)
```

Import the selectors in your components and render data as you like.

```javascript
// UserList.js

import React from 'react';
import { connect } from 'react-redux';

import UserList './UserList';
import {
  selectEntity,
  selectEntities
} from './selectors';

function mapStateToProps(state, props) {
  return {
    // Get all entities of a type
    allUsers: schemaSelectors.selectEntities(state, 'users'),
    // Get all entities of a type with certain IDs
    filteredUsers: schemaSelectors.selectEntities(state, 'users', state.userList.filteredIds),
    // Get a single entity of a type with a certain ID
    loggedInUser: schemaSelectors.selectEntity(state, 'users', props)
  };
}

export default connect(mapStateToProps)(UserList);
```
