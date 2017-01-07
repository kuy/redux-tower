// @flow

import { take, fork, call, put } from 'redux-saga/effects';
import {
  successLogin, failureLogin,
  successLogout, failureLogout,
  REQUEST_LOGIN, REQUEST_LOGOUT
} from '../actions';
import * as api from '../api';
import type { IOEffect } from 'redux-saga/effects';

function* handleLogin(): Generator<IOEffect,void,*> {
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

function* handleLogout(): Generator<IOEffect,void,*> {
  while (true) {
    const { payload } = yield take(REQUEST_LOGOUT);
    const { data, error } = yield call(api.auth.logout);
    if (data && !error) {
      yield put(successLogout());
    } else {
      yield put(failureLogout(error));
    }
  }
}

export default function* authSaga(): Generator<IOEffect,void,*> {
  yield fork(handleLogin);
  yield fork(handleLogout);
}
