import { put, call, fork } from 'redux-saga/effects';
import { createBrowserHistory, actions } from '../../../src/index';
import router from '../../../src/saga';
import { loadPosts, loadPost } from './index';

import PostsIndex from '../pages/posts/index';
import PostsShow from '../pages/posts/show';
import About from '../pages/about';
import Loading from '../pages/loading';

const offset = 'blog';

const routes = {
  '/': '/posts',
  '/posts': function* postsIndexPage({ query }) {
    yield call(loadPosts, query);
    yield put(actions.changePage(PostsIndex));
  },
  '/posts/:id': function* postsShowPage({ params: { id } }) {
    yield call(loadPost, id);
    yield put(actions.changePage(PostsShow));
  },
  '/about': About,
};

export default function* routesSaga() {
  const history = createBrowserHistory();
  yield fork(router, { history, routes, initial: Loading, offset });
}
