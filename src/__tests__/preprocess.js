import test from 'ava';
import { Component } from 'react';
import preprocess, { flatten, interpolate, resolve, resolveRelative } from '../preprocess';

class Page extends Component {}

test('preprocess - flat', t => {
  let routes = {
    '/top': '/home',
    '/': Page,
    '/home': '/',
  };
  let actual = preprocess(routes);
  t.is(actual['/top'], actual['/']);
  t.true(typeof actual['/'][1].prototype.isReactComponent === 'undefined');
  t.is(actual['/home'], actual['/']);
});

test('preprocess - nested', t => {
  const fn = name => () => name;
  let routes = {
    '/': Page,
    '/blog': {
      '/': '../',
      '/home': './',
      '/latest': './posts',
      '/posts': {
        '/': fn('posts-index'),
        '/:id': fn('posts-show'),
        '/new': fn('posts-new'),
        '/about': '../../about',
      },
    },
    '/news': '/blog/posts',
    '/jobs': {
      '/': fn('jobs-index'),
      '/:id': fn('jobs-show'),
      '/contact': '../about',
    },
    '/about': fn('about'),
  };
  let actual = preprocess(routes);
  t.true(typeof actual['/'][1].prototype.isReactComponent === 'undefined');
  t.is(actual['/news'][1](), 'posts-index');
  t.is(actual['/about'][1](), 'about');
  t.is(actual['/blog'], actual['/']);
  t.is(actual['/blog/home'], actual['/']);
  t.is(actual['/blog/latest'][1](), 'posts-index');
  t.is(actual['/blog/posts'][1](), 'posts-index');
  t.is(actual['/blog/posts/:id'][1](), 'posts-show');
  t.is(actual['/blog/posts/new'][1](), 'posts-new');
  t.is(actual['/blog/posts/about'][1](), 'about');
});

test('flatten - basic', t => {
  let routes = interpolate({
    '/': 1,
    '/hoge': '/',
  });
  t.deepEqual(flatten(routes), {
    '/': [[], 1, []],
    '/hoge': [[], '/', []],
  });

  routes = interpolate({
    '/': 1,
    '/blog': {
      '/': 2,
      '/posts': '/',
    },
  });
  t.deepEqual(flatten(routes), {
    '/': [[], 1, []],
    '/blog': [[], 2, []],
    '/blog/posts': [[], '/', []],
  });
});

test('flatten - nested', t => {
  let routes = interpolate({
    '/': 1,
    '/hoge': 2,
    '/foo': {
      '/': '../',
      '/bar': './',
    },
    '/pen': {
      '/pineapple': {
        '/apple': {
          '/pen': '../../../../watch/on/youtube'
        },
        '/orange': './apple',
      },
    },
    '/watch': {
      '/on': {
        '/youtube': 3,
      },
    },
    '/zzz': 4,
  });
  t.deepEqual(flatten(routes), {
    '/': [[], 1, []],
    '/hoge': [[], 2, []],
    '/foo': [[], '/', []],
    '/foo/bar': [[], '/foo', []],
    '/pen/pineapple/apple/pen': [[], '/watch/on/youtube', []],
    '/pen/pineapple/orange': [[], '/pen/pineapple/apple', []],
    '/watch/on/youtube': [[], 3, []],
    '/zzz': [[], 4, []],
  });
});

test('resolveRelative', t => {
  t.is(resolveRelative('/blog/posts', ['', '/blog']), '/blog/posts');
  t.is(resolveRelative('/', ['', '/blog', '/posts']), '/');

  t.is(resolveRelative('./', ['', '/blog']), '/blog/');
  t.is(resolveRelative('./', ['']), '/');
  t.is(resolveRelative('./posts', ['', '/blog']), '/blog/posts');
  t.is(resolveRelative('./posts/1', ['', '/blog']), '/blog/posts/1');
  t.is(resolveRelative('./1', ['', '/blog', '/posts']), '/blog/posts/1');

  // t.is(resolveRelative('./posts/./1', ['', '/blog']), '/blog/posts/1');

  t.is(resolveRelative('../', ['', '/blog']), '/');
  t.is(resolveRelative('../../', ['', '/blog', '/posts']), '/');
  t.is(resolveRelative('../../apple', ['', '/blog', '/posts']), '/apple');
  t.is(resolveRelative('../orange', ['', '/blog', '/posts']), '/blog/orange');
  t.is(resolveRelative('../orange/banana', ['', '/blog', '/posts']), '/blog/orange/banana');

  // let error = t.throws(() => {
  //   resolveRelative('../', ['']);
  // });
  // t.is(error.message, "");
  // t.is(resolveRelative('../orange/../posts/2', ['', '/blog', '/posts']), '/blog/posts/2');
});

test('interpolate - basic', t => {
  // Minimum
  const enter = function*(){};
  const action = function*(){};
  const leave = function*(){};
  let routes = {
    '/a': [enter, {
      '/b': action,
    }, leave],
  };
  t.deepEqual(interpolate(routes), {
    '/a': {
      '/b': [[enter], action, [leave]],
    },
  });

  routes = {
    '/a': [enter, {
      '/b': action,
    }],
  };
  t.deepEqual(interpolate(routes), {
    '/a': {
      '/b': [[enter], action, []],
    },
  });

  routes = {
    '/a': [{
      '/b': action,
    }, leave],
  };
  t.deepEqual(interpolate(routes), {
    '/a': {
      '/b': [[], action, [leave]],
    },
  });

  routes = {
    '/a': [{
      '/b': action,
    }],
  };
  t.deepEqual(interpolate(routes), {
    '/a': {
      '/b': [[], action, []],
    },
  });

  // Action with leave hook
  routes = {
    '/a': [enter, {
      '/b': [action, leave],
    }],
  };
  t.deepEqual(interpolate(routes), {
    '/a': {
      '/b': [[enter], action, [leave]],
    },
  });

  // With redirection
  routes = {
    '/a': [enter, {
      '/b': '/a',
    }],
  };
  t.deepEqual(interpolate(routes), {
    '/a': {
      '/b': [[enter], '/a', []],
    },
  });

  // No hooks
  routes = {
    '/': action,
    '/a': {
      '/b': action,
    },
    '/x': action,
  };
  t.deepEqual(interpolate(routes), {
    '/': [[], action, []],
    '/a': {
      '/b': [[], action, []],
    },
    '/x': [[], action, []],
  });

  // Check invalid routes
  routes = {
    '/a': [enter, {
      '/b': action,
    }, leave, leave],
  };
  let error = t.throws(() => {
    interpolate(routes);
  });
  t.is(error.message, "You can only use one hook each enter/leave in '/a': length=4");

  routes = {
    '/a': [enter, action, leave],
  };
  error = t.throws(() => {
    interpolate(routes);
  });
  t.is(error.message, "Hooks can be specified with nested routes in '/a'");

  routes = {
    '/a': [enter, enter, {
      '/b': action,
    }],
  };
  error = t.throws(() => {
    interpolate(routes);
  });
  t.is(error.message, "Hooks can be specified with nested routes in '/a'");
});

test('interpolate - more nested', t => {
  const action = function*(){};
  let routes = {
    '/': action,
    '/a': ['ENTER-A', {
      '/b': ['ENTER-B', {
        '/c': [{
          '/d': action,
        }, 'LEAVE-C'],
      }],
      '/x': action,
    }, 'LEAVE-A'],
  };
  t.deepEqual(interpolate(routes), {
    '/': [[], action, []],
    '/a': {
      '/b': {
        '/c': {
          '/d': [['ENTER-A', 'ENTER-B'], action, ['LEAVE-C', 'LEAVE-A']]
        },
      },
      '/x': [['ENTER-A'], action, ['LEAVE-A']],
    },
  });
});

test('resolve', t => {
  let routes = {
    '/': [[], 1, []],
    '/a': [['ENTER-A'], '/a/b', ['LEAVE-B']],
    '/a/b': [['ENTER-A', 'ENTER-B'], '/', ['LEAVE-B', 'LEAVE-A']],
    '/a/b/c': [['ENTER-A', 'ENTER-B', 'ENTER-C'], '/a', ['LEAVE-C', 'LEAVE-B', 'LEAVE-A']],
  };
  resolve(routes);
  t.deepEqual(routes, {
    '/': [[], 1, []],
    '/a': [[], 1, []],
    '/a/b': [[], 1, []],
    '/a/b/c': [[], 1, []],
  });

  routes = {
    '/': [[], 1, []],
    '/a': [['ENTER-A'], 2, ['LEAVE-B']],
    '/a/b': [['ENTER-A', 'ENTER-B'], '/a', ['LEAVE-B', 'LEAVE-A']],
  };
  resolve(routes);
  t.deepEqual(routes, {
    '/': [[], 1, []],
    '/a': [['ENTER-A'], 2, ['LEAVE-B']],
    '/a/b': [['ENTER-A'], 2, ['LEAVE-B']],
  });

  // Check errors
  routes = {
    '/xxx': [[], '/xxx', []],
  };
  let error = t.throws(() => {
    resolve(routes);
  });
  t.is(error.message, "Potential for circular reference in '/xxx'");

  routes = {
    '/': [[], '/a', []],
    '/a': [['ENTER-A'], '/', []],
  };
  error = t.throws(() => {
    resolve(routes);
  });
  t.is(error.message, "Potential for circular reference in '/'");

  routes = {
    '/': [[], '/a', []],
    '/a': [[], '/a/b', []],
    '/a/b': [[], '/', []],
  };
  error = t.throws(() => {
    resolve(routes);
  });
  t.is(error.message, "Potential for circular reference in '/'");
});
