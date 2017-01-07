// @flow

import { delay } from 'redux-saga';
import { fork, call, put, takeLatest } from 'redux-saga/effects';
import { REQUEST_SEARCH } from '../actions';
import type { IOEffect } from 'redux-saga/effects';

function* searchWithDelay({ payload: action }) {
  yield call(delay, 500);
  yield put(action);
}

function* handleSearch(): Generator<IOEffect,void,*> {
  yield takeLatest(REQUEST_SEARCH, searchWithDelay);
}

export default function* searchSaga(): Generator<IOEffect,void,*> {
  yield fork(handleSearch);
}
