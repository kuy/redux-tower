// @flow

import { takeEvery } from 'redux-saga';
import { put, call, fork } from 'redux-saga/effects';
import * as api from '../api';
import {
  requestFetchPosts, successFetchPosts, failureFetchPosts,
  requestStorePosts, successStorePosts, failureStorePosts,
  REQUEST_STORE_POSTS,
} from '../actions';
import type { IOEffect } from 'redux-saga/effects';
import type { PostId, Post, QueryParams } from '../api';
import type { Action } from '../actions';

export function* loadPosts(params: QueryParams): Generator<IOEffect,void,*> {
  yield put(requestFetchPosts());
  const { data, error } = yield call(api.posts.all, params);
  if (data && !error) {
    yield put(successFetchPosts(data));
  } else {
    yield put(failureFetchPosts(error));
  }
}

export function* loadPost(id: PostId): Generator<IOEffect,void,*> {
  yield put(requestFetchPosts());
  const { data, error } = yield call(api.posts.one, id);
  if (data && !error) {
    yield put(successFetchPosts(data));
  } else {
    yield put(failureFetchPosts(error));
  }
}

function* storePosts({ payload }: Action) {
  const { data, error } = yield call(api.posts.update, payload);
  if (data && !error) {
    yield put(successStorePosts(data));
  } else {
    yield put(failureStorePosts(error));
  }
}

export function* handleRequestStorePosts(): Generator<IOEffect,void,*> {
  yield takeEvery(REQUEST_STORE_POSTS, storePosts);
}

export default function* postsSaga(): Generator<IOEffect,void,*> {
  yield fork(handleRequestStorePosts);
}
