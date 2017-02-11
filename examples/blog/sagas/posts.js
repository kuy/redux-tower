// @flow

import { put, call } from 'redux-saga/effects';
import { takeEvery } from 'redux-saga';
import * as api from '../api';
import {
  requestFetchPosts, successFetchPosts, failureFetchPosts,
  successCreatePost, failureCreatePost,
  successStorePost, failureStorePost,
  successDeletePost, failureDeletePost,
  REQUEST_CREATE_POST, REQUEST_STORE_POST, REQUEST_DELETE_POST
} from '../actions';
import type { IOEffect } from 'redux-saga/effects';
import type { PostId, QueryParams } from '../api';
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

function* createPost({ payload }: Action) {
  const { data, error } = yield call(api.posts.create, payload);
  if (data && !error) {
    yield put(successCreatePost(data));
  } else {
    yield put(failureCreatePost(error));
  }
}

function* storePost({ payload }: Action) {
  const { data, error } = yield call(api.posts.update, payload);
  if (data && !error) {
    yield put(successStorePost(data));
  } else {
    yield put(failureStorePost(error));
  }
}

function* deletePost({ payload }: Action) {
  const { data, error } = yield call(api.posts.delete, payload);
  if (data && !error) {
    yield put(successDeletePost(data));
  } else {
    yield put(failureDeletePost(error));
  }
}

export default function* postsSaga(): Generator<*,void,*> {
  yield takeEvery(REQUEST_CREATE_POST, createPost);
  yield takeEvery(REQUEST_STORE_POST, storePost);
  yield takeEvery(REQUEST_DELETE_POST, deletePost);
}
