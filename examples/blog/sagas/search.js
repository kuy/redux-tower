import { takeLatest, delay } from 'redux-saga';
import { fork, call, put } from 'redux-saga/effects';
import { REQUEST_SEARCH } from '../actions';

function* searchWithDelay({ payload: action }) {
  yield call(delay, 500);
  yield put(action);
}

function* handleSearch() {
  yield takeLatest(REQUEST_SEARCH, searchWithDelay);
}

export default function* searchSaga() {
  yield fork(handleSearch);
}
