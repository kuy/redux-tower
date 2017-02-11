// @flow

import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import reducer from './reducers';
import rootSaga from './sagas/index';
import type { Action } from './actions';
import type { State } from './reducers';
import type { Store, Middleware } from 'redux';

export default function configureStore(initialState: State): Store<State, Action> {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const sagaMiddleware: Middleware<State, Action> = createSagaMiddleware();
  const store = createStore(
    reducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        sagaMiddleware, logger()
      )
    )
  );
  sagaMiddleware.run(rootSaga);
  return store;
}
