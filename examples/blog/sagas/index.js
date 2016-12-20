import { fork } from 'redux-saga/effects';
import routes from './routes';

export default function* rootSaga() {
  yield fork(routes);
}
