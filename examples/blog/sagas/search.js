import { takeLatest, delay } from 'redux-saga';
import { fork, call, put } from 'redux-saga/effects';
import { PREFLIGHT_REQUEST_SEARCH } from '../actions';

function* searchWithDelay({ payload: action }) {
  yield call(delay, 500);
  yield put(action);
}

function* handlePreflight() {
  yield takeLatest(PREFLIGHT_REQUEST_SEARCH, searchWithDelay);
}

export default function* searchSaga() {
  yield fork(handlePreflight);
}
