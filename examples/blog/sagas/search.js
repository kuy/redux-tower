// @flow

import { delay } from 'redux-saga';
import { fork, call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { REQUEST_SEARCH } from '../actions';
import type { IOEffect } from 'redux-saga/effects';

type Action = {
  payload: {
    type: string;
  };
};

function* searchWithDelay({ payload: action }:Action):Generator<*,void,*>{
  yield call(delay, 500);
  yield put(action);
}

function* handleSearch(): Generator<*,void,*> {
  yield takeLatest(REQUEST_SEARCH, searchWithDelay);
}

export default function* searchSaga(): Generator<IOEffect,void,*> {
  yield fork(handleSearch);
}
