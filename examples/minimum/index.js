import 'babel-polyfill';
import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import createSagaMiddleware, { delay } from 'redux-saga';
import { call, fork, put } from 'redux-saga/effects';
import { saga as routerSaga, reducer as routerReducer, actions, createHashHistory } from '../../src/index';
import { Router } from '../../src/react/index';

// Pages
function Navigation() {
  return <ul>
    <li><a href='/#/'>Index</a></li>
    <li><a href='/#/tower'>Tower</a></li>
  </ul>;
}

class Index extends PureComponent {
  render() {
    return <div>
      <h1>Index</h1>
      <Navigation />
      <p>Hi, I'm index page.</p>
    </div>;
  }
}

class Tower extends PureComponent {
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
    yield put(actions.changePage(Tower));
  }
};

// History
const history = createHashHistory();

// Saga
function* rootSaga() {
  yield fork(routerSaga, history, routes);
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
