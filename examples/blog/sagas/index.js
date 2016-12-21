import { fork } from 'redux-saga/effects';
import routes from './routes';
import search from './search';

export default function* rootSaga() {
  yield fork(routes);
  yield fork(search);
}
