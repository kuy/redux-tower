import { fork } from 'redux-saga/effects';
import routes from './routes';
import search from './search';
import posts from './posts';
import auth from './auth';

export default function* rootSaga() {
  yield fork(routes);
  yield fork(search);
  yield fork(posts);
  yield fork(auth);
}
