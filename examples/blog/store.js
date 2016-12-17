// @flow

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import reducer from './reducers';
import rootSaga from './sagas/index';
import type { State } from './reducers';
import type { Store, Middleware } from 'redux';

export default function configureStore(initialState: State): Store {
  const sagaMiddleware: Middleware = createSagaMiddleware();
  const store: Store = createStore(
    reducer,
    initialState,
    applyMiddleware(
      sagaMiddleware, logger()
    )
  );
  sagaMiddleware.run(rootSaga);
  return store;
};
