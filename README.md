# redux-entitize

Automated [redux](https://github.com/reactjs/redux)-state management for all your entities.

`redux-entitize` maintains normalized entities in the state and provides:

- an entities reducer
- entity update / delete action creators
- entity selectors

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

`redux-entitize` provides a creator function for a single entities reducer handles the update and delete operations on your entities.
Here is how you set up a reducer according to your `normalizr` schemas.

```javascript
// main.js

import { combineReducers } from 'redux';
import { normalize, schema } from 'normalizr';
import { createEntitiesReducer } from 'redux-entitize';

const userSchema = new schema.Entity('users');
const commentSchema = new schema.Entity('comments', {
  commenter: userSchema
});

export const schemas = {
  "users": userSchema,
  "comments": commentSchema,
};

```javascript
// reducers.js

import { schemas } from 'main.js';

const entitiesReducer = createEntitiesReducer(schemas);

export const reducers = combineReducers({
  someReducer: (state, action) => 42,
  entitiesReducer
});
```

`redux-entitize` maintains your normalized entities in the state and provides action creators to:
1) Update entities (inserts new entities, overrides existing entities)
2) Delete entities

```javascript
// actions.js

import { createStore } from 'redux';
import {
  updateEntityAction,
  updateEntitiesAction,
} from 'redux-entitize';

import { reducers } from 'reducers.js';

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
import { schemas } from 'main.js'

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
} from 'selectors.js';

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
    // Or even select particular entities by id:
    specialUsers: selectEntities(state, 'users', ["123", "124", "721"]),
    particularComment: selectEntity(state, 'comments', "890"])
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserList);
```
