import createBrowserHistory from 'history/createBrowserHistory';
import createHashHistory from 'history/createHashHistory';
import saga from './saga';
import reducer from './reducer';
import * as actions from './actions';
import { ERROR } from './preprocess';

export { createBrowserHistory, createHashHistory, saga, reducer, actions, ERROR };
