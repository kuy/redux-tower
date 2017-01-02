import test from 'ava';
import { Component } from 'react';
import { put, select } from 'redux-saga/effects';
import { createMemoryHistory } from 'history';
import * as saga from '../saga';
import * as actions from '../actions';

function isChannel(obj) {
  return typeof obj.take === 'function'
    && typeof obj.flush === 'function'
    && typeof obj.close === 'function';
}

class Index extends Component {}
class Login extends Component {}
class Hoge extends Component {}
class Dashboard extends Component {}
class Edit extends Component {}

function createTower(routes) {
  const offset = '';
  const matcher = saga.createMatcher(routes);
  const history = createMemoryHistory();
  return { tower: saga.theControlTower({ history, matcher, offset }), history };
}

test('theControlTower - basic', t => {
  const routes = {
    '/': Index,
    '/hoge': Hoge,
  };
  const { tower: i } = createTower(routes);

  let ret = i.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: { type: '@@redux-tower/PUSH', payload: ['/'] },
  });

  // Wait location change
  ret = i.next();
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/hoge'
  ret = i.next({ pathname: '/hoge', search: '' });
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: "/hoge", params: {}, query: {}, splats: [], route: "/hoge" }
    },
  });

  // Launch runRouteAction
  ret = i.next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  let args = ret.value.CALL.args;
  t.is(typeof args[0]._invoke, 'function');
  t.deepEqual(args[1], []);
  t.deepEqual(args[2], []);
  t.is(args[3], undefined);
  t.true(isChannel(args[4]));

  // Run main action
  const a = saga.runRouteAction(...args);

  // Show Hoge page
  ret = a.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Hoge
    },
  });

  // Done main action, back to Tower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

function moveTo(i, pathname) {
  let ret = i.next();
  ret = i.next();
  ret = i.next({ pathname, search: '' });
  ret = i.next();
  return saga.runRouteAction(...ret.value.CALL.args);
}

test.only('theControlTower - entering hooks', async t => {
  const isNotLoggedIn = () => {};
  const routes = {
    '/': Index,
    '/login': Login,
    '/admin': [function* enter() {
      if (yield select(isNotLoggedIn)) {
        yield '/login'; // Redirect
      }
    }, {
      '/': './dashboard',
      '/dashboard': Dashboard
    }],
  };
  const { tower: i, history } = createTower(routes);

  // Run entering hook
  let a = moveTo(i, '/admin');

  // Login check
  let ret = a.next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isNotLoggedIn, args: [] } },
    done: false
  });

  // Redirect to '/login'
  ret = a.next(true); // result of isNotLoggedIn
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: { type: '@@redux-tower/REPLACE', payload: ['/login'] },
  });

  // Simulate: queue history event
  history.replace('/login');

  // Done entering hook, back to Tower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Run main action
  ret = i.next(ret.value);
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  a = saga.runRouteAction(...ret.value.CALL.args);

  // Show Dashboard page
  ret = a.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Dashboard
    },
  });

  // Done main action, back to Tower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Simulate: drive event channel
  let val = await new Promise(resolve => {
    ret.value.TAKE.channel.take(loc => resolve(loc));
  });

  // Redirect to '/login' by entering hook
  ret = i.next(val);
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: '/login', params: {}, query: {}, splats: [], route: '/login' }
    },
  });

  // Run main action
  ret = i.next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  a = saga.runRouteAction(...ret.value.CALL.args);

  // Show Login page
  ret = a.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Login
    },
  });

  // Done main action, back to Tower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/admin' (try again)
  ret = i.next({ pathname: '/admin', search: '' });
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: '/admin', params: {}, query: {}, splats: [], route: '/admin' }
    },
  });

  // Run entering hook
  ret = i.next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  a = saga.runRouteAction(...ret.value.CALL.args);

  // Login check
  ret = a.next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isNotLoggedIn, args: [] } },
    done: false
  });

  // Done entering hook, back to Tower
  ret = a.next(false); // result of isNotLoggedIn
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Run main action
  ret = i.next(ret.value);
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  a = saga.runRouteAction(...ret.value.CALL.args);

  // Show Dashboard page
  ret = a.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Dashboard
    },
  });

  // Done main action, back to Tower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

test('theControlTower - leaving hooks', t => {
  const isDirty = () => {};
  function* leave() {
    if (yield select(isDirty)) {
      yield false; // Prevent
    }
  }
  const routes = {
    '/': Index,
    '/posts': {
      '/:id/edit': [Edit, leave]
    },
  };
  const i = createTower(routes);

  // Run main action
  let a = moveTo(i, '/posts/10/edit');

  // Show Edit page
  let ret = a.next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Edit
    },
  });

  // Done main action, back to Tower
  ret = a.next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [leave], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/'
  ret = i.next({ pathname: '/', search: '' });
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: "/", params: {}, query: {}, splats: [], route: "/" }
    },
  });

  // Run main action
  ret = i.next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  a = saga.runRouteAction(...ret.value.CALL.args);

  // Run leaving hook
  ret = a.next();
  t.is(ret.value.CALL.fn, saga.runHook);
  let b = saga.runHook(...ret.value.CALL.args);

  // Dirty check
  ret = b.next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isDirty, args: [] } },
    done: false
  });

  // Prevented by leaving hook
  ret = b.next(true); // result of isDirty
  t.deepEqual(ret, { value: false, done: true });

  // Done leaving hook, back to Tower
  ret = a.next(false);
  t.deepEqual(ret, { value: { prevented: true, hooks: [leave], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/' (try again)
  ret = i.next({ pathname: '/', search: '' });
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: "/", params: {}, query: {}, splats: [], route: "/" }
    },
  });

  // Run main action
  ret = i.next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  a = saga.runRouteAction(...ret.value.CALL.args);

  // Run leaving hook
  ret = a.next();
  t.is(ret.value.CALL.fn, saga.runHook);
  b = saga.runHook(...ret.value.CALL.args);

  // Dirty check
  ret = b.next();
  t.deepEqual(ret, {
    value: { '@@redux-saga/IO': true, SELECT: { selector: isDirty, args: [] } },
    done: false
  });

  // Prevented by leaving hook
  // Done leaving hook, back to main action
  ret = b.next(false); // result of isDirty
  t.deepEqual(ret, { value: true, done: true });

  // Show Index page
  ret = a.next(true);
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Index
    },
  });

  // Done main action, back to Tower
  ret = a.next(true);
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  // Wait location change (loop)
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});
