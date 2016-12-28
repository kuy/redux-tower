import 'babel-polyfill';
import test from 'ava';
import { Component } from 'react';
import * as saga from '../saga';

class Page extends Component {}

test('preprocess - flat', t => {
  let routes = {
    '/top': '/home',
    '/': Page,
    '/home': '/',
  };
  let actual = saga.preprocess(routes);
  t.is(actual['/top'], actual['/']);
  t.true(typeof actual['/'].prototype.isReactComponent === 'undefined');
  t.is(actual['/home'], actual['/']);

  routes = {
    '/circular': '/routing',
    '/routing': '/circular',
  };
  let error = t.throws(() => {
    saga.preprocess(routes);
  });
  t.is(error.message, "Detected circular reference in '/routing'");

  // TODO: 3 or more circular references: /a -> /b -> /c -> /a

  routes = {
    '/me': '/me',
  };
  error = t.throws(() => {
    saga.preprocess(routes);
  });
  t.is(error.message, "Detected circular reference in '/me'");
});

function fn(name) {
  return () => name;
}

test('preprocess - nested', t => {
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
  let actual = saga.preprocess(routes);
  t.true(typeof actual['/'].prototype.isReactComponent === 'undefined');
  console.log(actual['/news']);
  t.is(actual['/news'](), 'posts-index');
  t.is(actual['/about'](), 'about');
  t.is(actual['/blog'], actual['/']);
  t.is(actual['/blog/home'], actual['/']);
  t.is(actual['/blog/latest'](), 'posts-index');
  t.is(actual['/blog/posts'](), 'posts-index');
  t.is(actual['/blog/posts/:id'](), 'posts-show');
  t.is(actual['/blog/posts/new'](), 'posts-new');
  t.is(actual['/blog/posts/about'](), 'about');
});

test('flatten', t => {
  let routes = {
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
  };
  t.deepEqual(saga.flatten(routes), {
    '/': 1,
    '/hoge': 2,
    '/foo': '/',
    '/foo/bar': '/foo',
    '/pen/pineapple/apple/pen': '/watch/on/youtube',
    '/pen/pineapple/orange': '/pen/pineapple/apple',
    '/watch/on/youtube': 3,
    '/zzz': 4,
  });
});

test('resolveRelative', t => {
  t.is(saga.resolveRelative('/blog/posts', ['', '/blog']), '/blog/posts');
  t.is(saga.resolveRelative('/', ['', '/blog', '/posts']), '/');

  t.is(saga.resolveRelative('./', ['', '/blog']), '/blog/');
  t.is(saga.resolveRelative('./', ['']), '/');
  t.is(saga.resolveRelative('./posts', ['', '/blog']), '/blog/posts');
  t.is(saga.resolveRelative('./posts/1', ['', '/blog']), '/blog/posts/1');
  t.is(saga.resolveRelative('./1', ['', '/blog', '/posts']), '/blog/posts/1');

  // t.is(saga.resolveRelative('./posts/./1', ['', '/blog']), '/blog/posts/1');

  t.is(saga.resolveRelative('../', ['', '/blog']), '/');
  t.is(saga.resolveRelative('../../', ['', '/blog', '/posts']), '/');
  t.is(saga.resolveRelative('../../apple', ['', '/blog', '/posts']), '/apple');
  t.is(saga.resolveRelative('../orange', ['', '/blog', '/posts']), '/blog/orange');
  t.is(saga.resolveRelative('../orange/banana', ['', '/blog', '/posts']), '/blog/orange/banana');

  // let error = t.throws(() => {
  //   saga.resolveRelative('../', ['']);
  // });
  // t.is(error.message, "");
  // t.is(saga.resolveRelative('../orange/../posts/2', ['', '/blog', '/posts']), '/blog/posts/2');
});

test('interpolate - basic', t => {
  const action = function*(){};
  let routes = {
    '/a': ['ENTER-A', {
      '/b': action,
    }, 'LEAVE-A'],
  };
  t.deepEqual(saga.interpolate(routes), {
    '/a': {
      '/b': ['ENTER-A', action, 'LEAVE-A'],
    },
  });

  routes = {
    '/a': ['ENTER-A', {
      '/b': action,
    }],
  };
  t.deepEqual(saga.interpolate(routes), {
    '/a': {
      '/b': ['ENTER-A', action],
    },
  });

  routes = {
    '/a': [{
      '/b': action,
    }, 'LEAVE-A'],
  };
  t.deepEqual(saga.interpolate(routes), {
    '/a': {
      '/b': [action, 'LEAVE-A'],
    },
  });

  routes = {
    '/a': [{
      '/b': action,
    }],
  };
  t.deepEqual(saga.interpolate(routes), {
    '/a': {
      '/b': [action],
    },
  });

  routes = {
    '/a': ['ENTER-A', {
      '/b': action,
    }, 'LEAVE-A', 'MORE'],
  };
  let error = t.throws(() => {
    saga.interpolate(routes);
  });
  t.is(error.message, "You can only use one hook each enter/leave in '/a': length=4");

  routes = {
    '/a': ['ENTER-A', action, 'LEAVE-A'],
  };
  error = t.throws(() => {
    saga.interpolate(routes);
  });
  t.is(error.message, "Hooks can be specified with nested routes in '/a'");

  routes = {
    '/a': ['ENTER-A', 'EXTRA', {
      '/b': action,
    }],
  };
  error = t.throws(() => {
    saga.interpolate(routes);
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
    }, 'LEAVE-A'],
  };
  t.deepEqual(saga.interpolate(routes), {
    '/': [action],
    '/a': {
      '/b': {
        '/c': {
          '/d': ['ENTER-A', 'ENTER-B', action, 'LEAVE-C', 'LEAVE-A']
        },
      },
    },
  });
});
