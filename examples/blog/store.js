// @flow

import { createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import reducer from './reducers';
import rootSaga from './sagas/index';
import { interceptor } from './sagas/routes';
import type { State } from './reducers';
import type { Store, Middleware } from 'redux';

export default function configureStore(initialState: State): Store {
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const sagaMiddleware: Middleware = createSagaMiddleware();
  const store: Store = createStore(
    reducer,
    initialState,
    composeEnhancers(
      applyMiddleware(
        interceptor, sagaMiddleware, logger()
      )
    )
  );
  sagaMiddleware.run(rootSaga);
  return store;
};
