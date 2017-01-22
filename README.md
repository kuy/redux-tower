[![NPM Package][npm_img]][npm_site]
[![Travis][ci_img]][ci_site]
[![Coverage Status][ca_img]][ca_site]
[![Dependency Status][david_img]][david_site]
[![Greenkeeper badge](https://badges.greenkeeper.io/kuy/redux-tower.svg)](https://greenkeeper.io/)

# redux-tower

[Saga](https://github.com/redux-saga/redux-saga) powered routing engine for [Redux](http://redux.js.org/) apps.

redux-tower provides a way to fully control client-side routing with its related side effects
such as data fetching, user authentication, fancy animations.

**NOTICE: This package is ACTIVELY under development. API (both public and internal) may change suddenly.**


## Installation

```
npm install --save redux-tower
```


## The Goal

+ Integrated, Battery-included, but Replaceable
+ Affinity with Redux


## Why?

+ [react-router](https://github.com/ReactTraining/react-router) is just a component switcher. I don't want to depend on React component lifecycle.
+ [react-router-redux](https://github.com/reactjs/react-router-redux) doesn't help you to do something before showing a page component.
+ [redux-saga](https://github.com/redux-saga/redux-saga) brings long-running processes with async control flow to Redux.

### About redux-saga-router

[redux-saga-router](https://github.com/jfairbank/redux-saga-router) is a great routing library,
which brings sagas to the chaotic router world and gives a way to do side effects in redux-saga way when associated url is activated.
However, it can't be used to control the timing of showing the page component and what component should be shown,
because both react-router and redux-saga-router are working separately. I feel it annoying to maintain the separated route definitions.


## Examples

### Online Demo

+ **Minimum**: [Source](https://github.com/kuy/redux-tower/tree/master/examples/minimum) | [Demo](http://kuy.github.io/redux-tower/minimum/) | Minimum usage example with Hash based history.
+ **Blog**: [Source](https://github.com/kuy/redux-tower/tree/master/examples/blog) | [Demo](http://kuy.github.io/redux-tower/blog/) | Real World Blog app using [Semantic UI React](https://github.com/Semantic-Org/Semantic-UI-React).

[redux-logger](https://github.com/evgenyrodionov/redux-logger) is enabled. Open the JavaScript console of developer tools in your browser.
You can also use [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension) to see the store and the actions being fired.

### Try in local

Clone this repository and run following npm commands.

```
npm install
npm start
```

And then open `http://localhost:8080/` with your favorite browser.


## Usage

Here is a SFA (Single File Application) that shows you a simple routing with side effects.

```js
// Pages
function Navigation() {
  return <ul>
    <li><a href='#/'>Index</a></li>
    <li><a href='#/tower'>Tower</a></li>
  </ul>;
}

class Index extends Component {
  render() {
    return <div>
      <h1>Index</h1>
      <Navigation />
      <p>Hi, here is index page.</p>
    </div>;
  }
}

class Tower extends Component {
  render() {
    return <div>
      <h1>Tower</h1>
      <Navigation />
      <p>Here is tower page. You waited a while for loading this page.</p>
    </div>;
  }
}

// Routes
const routes = {
  '/': Index,
  *'/tower'() {
    yield call(delay, 1000);
    yield Tower;
  }
};

// History
const history = createHashHistory();

// Saga
function* rootSaga() {
  yield fork(routerSaga, { history, routes });
}

// Reducer
const reducer = combineReducers(
  { router: routerReducer }
);

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, {}, applyMiddleware(
  sagaMiddleware, logger()
));
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <Router />
  </Provider>,
document.getElementById('container'));
```


## API / Building Blocks

redux-tower consists of several different kinds of elements/components.
In this section, I'd like to introduce them step by step and how to integrate with your Redux application.

### Routes

First of all, you need to have the route definition which contains URL patterns and route actions.
The behavior of routing is deadly simple. When a url pattern is activated, the engine tests URL patterns,
and pick a route action from your definition, and runs it.
The difference with other routing libraries is that this is not a simple component switcher like react-router.
You can write a route action includes async control flows and interactions with Redux naturally to fully control the process of routing thanks to redux-saga.
For increasing readability and productivity, redux-tower allows you to use a shorthand notation for changing components and redirections.
The URL pattern is a plain string, but is able to capture a part of URL and captured values are passed to a route action as named parameters.

```js
import { actions, INITIAL, CANCEL, ERROR } from 'redux-tower';
import Home from '../path/to/home';

const routes = {
  // Initial action or component (Optional)
  [INITIAL]: Loading,

  '/': function* homePage() {
    // Do something, such as data fetching, authentication, etc.
    yield call(fetch, ...);

    // Update Redux's state
    yield put(data(...));

    // Change component
    yield Home; // Shorthand
  },

  // Nested routes
  '/posts': {
    // Receive query string like '/posts?q=keyword'
    // Use method syntax for route action
    *'/'({ query }) {
      yield call(loadPosts, query);

      // Change component (not shorthand)
      yield put(actions.changeComponent(PostsIndex));
    },

    // Receive named parameters like '/posts/1'
    '/:id': function* postsShowPage({ params: { id } }) {
      yield call(loadPost, id);
      yield PostsShow;
    },

    // Redirect to '/posts' after saving
    '/:id/update': function* postsUpdateAction({ params: { id } }) {
      yield call(savePost, ...);
      yield '/posts'; // Shorthand
    }
  },

  // Redirect to '/posts/:id' with fixed parameter
  '/about': '/posts/2', // Shorthand (lazy redirection)

  // Change component
  // Assign React component directly (except Stateless Functional Components)
  '/contact': Contact,

  // Default error page (Optional)
  [ERROR]: NotFound,

  // Global cancel action (Optional)
  [CANCEL]: function* cancel() {
    yield call(cancelFetch);
  }
};
```

### Hooks

In the route definition, a route action can have the entering/leaving hooks that are ran before/after the main action.
It's a bit tricky behavior because the both hooks have a different timing when they are executed.

```js
const routes = {
  // ...

  // Enable entering hook
  '/admin': [function* enterAdmin() {
    // Check logged-in or not
    if (yield select(isNotLoggedIn)) {
      // Redirect to login page
      yield '/users/login';
    }
  }, {
    // Admin section
    '/': './dashboard',
    '/dashboard': AdminDashboard,
    '/posts': {
      // Enable leaving hook
      '/:id/edit': [AdminPostsEdit, function* leaveEdit() {
        // Dirty check
        if (yield select(isDirty)) {
          // Prevent page transition
          yield false;
        }
      }]
    }
  }]

  '/users': {
    '/login': UsersLogin,
    '/logout': function* logout() {
      yield call(logout);
      yield '/';
    },
  }
};
```

### History

redux-tower is built on [history](https://www.npmjs.com/package/history) package so that you can choose a strategy from Hash based or History API.

```js
// History API
import { createBrowserHistory as createHistory } from 'redux-tower';

// Or Hash based
import { createHashHistory as createHistory } from 'redux-tower';

// ...

const history = createHistory();
```

### Saga

The core of routing engine, which mainly have two respnsibilities:

+ Detects location changes from `history` instance, reflects location data to Redux's store, and triggers route actions
+ Watches history related Redux's actions and operates `history` instance

Since it's provided as a saga, what you have to do is just launching it using `fork` effect in the root saga of your application.
Don't forget to pass the option when you fork. Here is a list of options.

+ history: An instance of `createBrowserHistory()` or `createHashHistory()`.
+ routes: A route definition that previously introduced.
* offset: [Optional] A offset path for `createBrowserHistory()`. No need to use for `createHashHistory()`.

```js
import { saga as router } from 'redux-tower';

// ...

export default function rootSaga() {
  yield fork(router, { history, routes });

  // ...
}
```

### Reducer

A reducer is used to expose the location data to Redux's store.

+ path: String. Path string, which is stripped a query string.
+ params: Object. Named parameters, which is mapped with placeholders in route patterns. `/users/:id` with `/users/1` gets `{ id: '1' }`.
+ query: Object. Parsed query string. `/search?q=hoge` gets `{ q: 'hoge' }`.
+ splats: Array. Unnamed parameters, which is splatted from placeholders in route patterns. `/posts/*/*`.

```js
import { reducer as router } from 'redux-tower';

// ...

export default combineReducers(
  { /* your reducers */, router }
);
```

### Actions

Since this library is made for Redux, all state transitions, including routing, are triggered by actions.

#### Core actions

+ `CHANGE_COMPONENT`: switch to other component

#### History actions

+ `PUSH`: pushes a new path
+ `REPLACE`: repalces with a new path
+ `GO`: 
+ `GO_BACK`: 
+ `GO_FORWARD`: 

### React components

These React components will help you for building an application.
I'm happy to hear feature requests and merge your PRs if you feel it doesn't satisfy your needs.

#### `<Router>`

A simple component switcher, which is connected with Redux.

```js
import { Router } from 'redux-tower/lib/react';

// ...

ReactDOM.render(
  <Provider store={configureStore()}>
    <Router />
  </Provider>,
document.getElementById('container'));
```

#### `<Link>`

`<Link>` component helps you to put a link in your Redux application.

```js
import { Link } from 'redux-tower/lib/react';

// ...

class Page extends Component {
  render() {
    return <div>
      <Link to='/'>Home</Link>
      <Link external to='https://github.com/kuy'>@kuy</Link>
    </div>;
  }
}
```


## Acknowledgment

redux-tower has inspired by [redux-saga-router](https://github.com/jfairbank/redux-saga-router).
Big thanks to [@jfairbank](https://github.com/jfairbank).


## License

MIT


## Author

Yuki Kodama / [@kuy](https://twitter.com/kuy)


[npm_img]: https://img.shields.io/npm/v/redux-tower.svg
[npm_site]: https://www.npmjs.org/package/redux-tower
[ci_img]: https://img.shields.io/travis/kuy/redux-tower/master.svg?style=flat-square
[ci_site]: https://travis-ci.org/kuy/redux-tower
[ca_img]: https://coveralls.io/repos/github/kuy/redux-tower/badge.svg?branch=master
[ca_site]: https://coveralls.io/github/kuy/redux-tower?branch=master
[david_img]: https://img.shields.io/david/kuy/redux-tower.svg
[david_site]: https://david-dm.org/kuy/redux-tower
