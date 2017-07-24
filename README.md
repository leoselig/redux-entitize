# redux-entitize

Automated [redux](https://github.com/reactjs/redux)-state management for all your entities.

`redux-entitize` helps you organize all your entities in unified and normalized state. It ships with:

- a reducer
- a set of action creators to populate your state with entity data
- a set of selectors to retrieve entities from the state

## Getting started

### Install

```bash
npm install --save redux-entitize
```

or

```bash
yarn add redux-entitize
```

### Usage Example

`redux-entitize` provides a factory function to create a reducer that handles the update and delete operations on your entities. The factory is needed because the reducer needs to know your normalizr-schemas in order to normalize your entities before putting them into the state.

Here is how you set up a reducer according to your `normalizr` schemas.

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

```javascript
// reducers.js

import { createEntitiesReducer } from 'redux-entitize';
import { combineReducers } from 'redux';
import { schemaMap } from './schemasMap';

const entitiesReducer = createEntitiesReducer(schemas);

export const reducers = combineReducers({
  someReducer: (state, action) => 42,
  entities: entitiesReducer // State slice is required to be called "entities" (for selectors)
});
```

To add new entities or update existing ones, use `updateEntityAction` / `updateEntitiesAction`.

To hard-delete an entity, use `deleteEntityAction`.

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

`redux-entitize` provides selectors to access entities from the state.

```javascript
// selectors.js

import { createSelectors } from 'redux-entitize';

// Assuming we have that `schemas` variable from above when you created your schemas
import { schemaMap } from './schemaMap'

export const {
  selectEntity,
  selectEntities,
} = createSelectors(schemas)
```

Import the selectors in your components and render data as you like.

```javascript
// UserList.js

import React from 'react';
import { connect } from 'react-redux';
import {
  selectEntity,
  selectEntities
} from './selectors';

function UserList(props) {
  return (
    <div>
      {
        props.users.map(user => {
          <p>user.email</p>
        })
      }
    </div>
  );
}

function mapStateToProps(state) {
  return {
    // Get all entities
    users: selectEntities(state, 'users'),
    // or even select particular entities by id:
    specialUsers: selectEntities(state, 'users', ["123", "124", "721"]),
    particularComment: selectEntity(state, 'comments', "890"])
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserList);
```
