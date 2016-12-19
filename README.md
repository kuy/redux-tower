# redux-saga-tower

[Saga](https://github.com/yelouafi/redux-saga) powered routing engine for [Redux](http://redux.js.org/) apps.

redux-saga-tower provides a way to fully control routing with its related side effects
such as data fetching, user authentication.

**NOTICE: This package is UNDER DEVELOPMENT. API will be changed suddenly. Do NOT use in production.**


## Install

```
npm install --save redux-saga-tower
```


## Why?

+ react-router is just a component switcher. I don't want to depend on React component lifecycle.
+ react-router-redux doesn't help you to do something before showing a page component.
+ redux-saga is a library for async control flow.

### About redux-saga-router

[redux-saga-router](https://github.com/jfairbank/redux-saga-router) is a great routing library,
which brings sagas to the chaotic router world and gives a way to do side effects in redux-saga way when associated url is activated.
However, it can't be used to control the timing of showing the page component and what component should be shown,
because both react-router and redux-saga-router are working separately. I feel it annoying to maintain the separated route definitions.


## Examples

### Online Demo: [Minimum](http://kuy.github.io/redux-saga-tower/minimum/) / [Blog](http://kuy.github.io/redux-saga-tower/blog/) 

```
npm install
npm start
```

And then open `http://localhost:8080/` with your favorite browser.

+ [Minimum](https://github.com/kuy/redux-saga-tower/tree/master/examples/minimum): Minimum usage with Hash based history.
+ [Blog](https://github.com/kuy/redux-saga-tower/tree/master/examples/blog): Blog app using [Semantic UI React](https://github.com/Semantic-Org/Semantic-UI-React).

You can use [Redux DevTools extension](https://github.com/zalmoxisus/redux-devtools-extension) to see the store and the actions being fired.


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
    yield put(actions.changeComponent(Tower));
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

redux-saga-tower consists of some components, such as a saga, a reducer, an actions, and React components.
In this section, I'd like to intrdouce them step by step and how to integrate with your Redux application.

### Routes

First of all, you need to define the routes with actions.

```js
import { actions } from 'redux-saga-tower';
import Home from '../path/to/home';

const routes = {
  '/': function* homePage() {
    // Do something, such as data fetching, authentication, etc.
    yield call(fetch, ...);

    // Update Redux's state
    yield put(data(...));

    // Pass a component you want to show
    yield put(actions.changeComponent(Home));
  },

  // Receive query string like '/posts?q=keyword'
  // Use method syntax
  *'/posts'({ query }) {
    yield call(loadPosts, query);
    yield put(actions.changeComponent(PostsIndex));
  },

  // Receive named parameters like '/posts/1'
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    yield call(loadPost, id);
    yield put(actions.changeComponent(PostsShow));
  },

  // Redirect to '/posts/:id' route with fixed parameter
  '/about': '/posts/2',

  // Assign React component directly
  '/contact': Contact,
};
```

### History

redux-saga-tower relies on [history](https://www.npmjs.com/package/history) package so that you can choose a strategy from Hash based or History API.

```js
// History API
import { createBrowserHistory as createHistory } from 'redux-saga-tower';

// Or Hash based
import { createHashHistory as createHistory } from 'redux-saga-tower';

// ...

const history = createHistory();
```

### Saga

A coordinator who detects location changes, updates location data in Redux's store, and activates associated action.
This saga takes an Object that contains following properties.

+ history: An instance of `createBrowserHistory()` or `createHashHistory()`.
+ routes: A routing defined in previous section.
* initial: [Optional] Initial component, which is used until a location change is occurred.

```js
import { saga as router } from 'redux-saga-tower';

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
+ splats: Array. *WIP*

```js
import { reducer as router } from 'redux-saga-tower';

// ...

export default combineReducers(
  { /* your reducers */, router }
);
```

### React components

These React components will help you for building an application.
I'm happy to hear feature requests and merge your PRs if you feel it doesn't have enough feature.

#### `<Router>`

A simple component switcher, which is connected with Redux.

```js
import { Router } from 'redux-saga-tower/react';

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
import { Link } from 'redux-saga-tower/react';

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


## The Goal

```js
const routes = {
  // Assign React component directry
  '/': Index,

  // Receive query parameters like '/posts?q=Apple'
  '/posts': function* postsIndexPage({ query }) {
    // Fetch list of posts with search and paging feature
    yield call(fetchPosts, query);

    // Show post index page
    yield PostsIndex;
  },

  // Receive named parameters like '/posts/1'
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    try {
      // Fetch a single post
      yield call(fetchPost);

      // Show post show page
      yield PostsShow;

    } finally {
      if (yield cancelled()) {
        // Cancel something
      }
    }
  },

  // Redirect to other route
  '/about': '/posts/2',

  '/login': function* usersLoginPage() {
    if (yield select(isLoggedIn)) {
      // Nothing to do
    } else {
      // Show login page
      yield UsersLogin;

      // Wait for login
      yield take(...);

      if (/* check auth */) {
        yield '/';
      } else {
        // Already in login page, nothing to do
      }
    }
  },

  '/logout': function* usersLogoutPage() {
    if (yield select(isLoggedIn)) {
      // Logout
      yield put(logout());

      // Show top page
      yield Index;
    } else {
      // Nothing to do
    }
  },
};
```


## Author

Yuki Kodama / [@kuy](https://twitter.com/kuy)


## Acknowledgment

redux-saga-tower has inspired by [redux-saga-router](https://github.com/jfairbank/redux-saga-router).
Big thanks to [@jfairbank](https://github.com/jfairbank).


## License

MIT
