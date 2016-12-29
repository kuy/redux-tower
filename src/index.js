import createBrowserHistory from 'history/createBrowserHistory';
import createHashHistory from 'history/createHashHistory';
import saga from './saga';
import createMiddleware from './middleware';
import reducer from './reducer';
import * as actions from './actions';

export { createBrowserHistory, createHashHistory, createMiddleware, saga, reducer, actions };
