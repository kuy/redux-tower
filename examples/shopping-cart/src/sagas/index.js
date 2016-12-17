import { put, fork, take } from 'redux-saga/effects';
import router from './router';

export default function* rootSaga() {
  yield fork(router);
}
