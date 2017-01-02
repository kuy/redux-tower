import test from 'ava';
import { Component } from 'react';
import { put, select, call } from 'redux-saga/effects';
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
  const cancel = function* () {
    yield put({ type: 'CANCEL' });
  };
  const matcher = saga.createMatcher(routes);
  const history = createMemoryHistory();
  return { tower: saga.theControlTower({ history, matcher, offset, cancel }), history, cancel };
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

  // Wait location change
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

test('theControlTower - entering hooks', async t => {
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
  t.deepEqual(ret, { value: { prevented: true, hooks: [], location: undefined }, done: true });

  // Wait location change
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Simulate: get queued value from history channel
  let val = await new Promise(resolve => {
    ret.value.TAKE.channel.take(loc => resolve(loc));
  });
  i.next(val);

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

  // Wait location change
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));

  // Go to '/admin' (try again)
  i.next({ pathname: '/admin', search: '' });

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

  // Wait location change
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
  const { tower: i } = createTower(routes);

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

  // Wait location change
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

  // Prevented in leaving hook
  ret = b.next(true); // result of isDirty
  t.deepEqual(ret, { value: false, done: true });

  // Done leaving hook, back to Tower
  ret = a.next(false);
  t.deepEqual(ret, { value: { prevented: true, hooks: [leave], location: undefined }, done: true });

  // Wait location change
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

  // Prevented in leaving hook
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

  // Wait location change
  ret = i.next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});

test.only('theControlTower - cancel hook', async t => {
  const api = () => {};
  const routes = {
    '/': function* index() {
      yield call(api);
      yield Index;
    },
    '/hoge': Hoge,
  };
  const { tower, history, cancel } = createTower(routes);
  const sagas = [tower];

  // Run main action
  sagas.push(moveTo(sagas[0], '/'));

  // Race API call and location change
  let ret = sagas[1].next();
  let race = ret.value.RACE;
  t.deepEqual(race.main.CALL, {
    context: null,
    fn: api,
    args: [],
  });
  let channel = race.loc.TAKE.channel;
  t.true(isChannel(channel));

  // Simulate: fire location change event while API calling
  history.push('/hoge');

  // Simulate: get new location from history channel
  let val = await new Promise(resolve =>
    channel.take(loc => resolve(loc))
  );

  // Run cancel hook
  ret = sagas[1].next({ loc: val });
  t.is(ret.value.CALL.fn, saga.runHook);
  sagas.push(saga.runHook(...ret.value.CALL.args));

  // Dispatch something from cancel hook
  ret = sagas[2].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: 'CANCEL'
    },
  });

  // Done cancel hook, back to runRouteAction
  ret = sagas[2].next();
  t.deepEqual(ret, { value: true, done: true });

  sagas.pop();

  // Cancelled main action by location change, back to Tower
  ret = sagas[1].next(ret.value);
  t.true(ret.value.prevented);
  t.deepEqual(ret.value.hooks, []);
  t.is(ret.value.location.pathname, '/hoge');
  t.is(ret.value.location.search, '');
  t.is(ret.value.location.hash, '');
  t.is(ret.value.location.state, undefined);
  t.true(ret.done);

  sagas.pop();

  // Restart with new location '/hoge'
  ret = sagas[0].next(ret.value);
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/UPDATE_PATH_INFO',
      payload: { path: '/hoge', params: {}, query: {}, splats: [], route: '/hoge' }
    },
  });

  // Run main action
  ret = sagas[0].next();
  t.is(ret.value.CALL.fn, saga.runRouteAction);
  sagas.push(saga.runRouteAction(...ret.value.CALL.args));

  // Show Hoge page
  ret = sagas[1].next();
  t.deepEqual(ret.value.PUT, {
    channel: null,
    action: {
      type: '@@redux-tower/CHANGE_COMPONENT',
      payload: Hoge
    },
  });

  // Done main action, back to Tower
  ret = sagas[1].next();
  t.deepEqual(ret, { value: { prevented: false, hooks: [], location: undefined }, done: true });

  sagas.pop();

  // Wait location change
  ret = sagas[0].next(ret.value);
  t.true(isChannel(ret.value.TAKE.channel));
});
