import { put, fork, take, call } from 'redux-saga/effects';
import routes from './routes';
import * as api from '../api';
import { requestFetchPosts, successFetchPosts, failureFetchPosts } from '../actions';

function fetchPosts(params) {
  return api.posts.all(params);
}

export function* loadPosts(params) {
  yield put(requestFetchPosts());
  const { data, error } = yield call(fetchPosts, params);
  if (data && !error) {
    yield put(successFetchPosts(data));
  } else {
    yield put(failureFetchPosts(error));
  }
}

function fetchPostById(id) {
  return api.posts.one(id);
}

export function* loadPost(id) {
  yield put(requestFetchPosts());
  const { data, error } = yield call(fetchPostById, id);
  if (data && !error) {
    yield put(successFetchPosts(data));
  } else {
    yield put(failureFetchPosts(error));
  }
}

export default function* rootSaga() {
  yield fork(routes);
}
