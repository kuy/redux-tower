import { put, call, fork, cancelled } from 'redux-saga/effects';
import { createBrowserHistory, actions } from '../../../src/index';
import router from '../../../src/saga';
import { loadPosts, loadPost } from './posts';
import { cancelFetchPosts } from '../actions';

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import About from '../pages/about';
import Loading from '../pages/loading';

const routes = {
  '/': '/posts',
  '/posts': function* postsIndexPage({ query }) {
    yield call(loadPosts, query);
    yield put(actions.changeComponent(PostsIndex));
  },
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    yield call(loadPost, id);
    yield put(actions.changeComponent(PostsShow));
  },
  '/about': About,
};

function* cancel() {
  yield put(cancelFetchPosts());
}

export default function* routesSaga() {
  const history = createBrowserHistory();
  yield fork(router, { history, routes, initial: Loading, cancel });
}
