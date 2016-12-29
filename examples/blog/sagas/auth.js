// @flow

import { take, fork, call, put } from 'redux-saga/effects';
import { successLogin, failureLogin, REQUEST_LOGIN } from '../actions';
import * as api from '../api';
import type { IOEffect } from 'redux-saga/effects';

function* handleLogin() {
  while (true) {
    const { payload } = yield take(REQUEST_LOGIN);
    const { data, error } = yield call(api.auth.login, payload);
    if (data && !error) {
      yield put(successLogin(data));
    } else {
      yield put(failureLogin(error));
    }
  }
}

export default function* authSaga(): Generator<IOEffect,void,*> {
  yield fork(handleLogin);
}
