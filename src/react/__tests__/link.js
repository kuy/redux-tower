import test from 'ava';
import React from 'react';
import { shallow } from 'enzyme';
import td from 'testdouble';
import { Link } from '../link';

test('basic', t => {
  const wrapper = shallow(<Link to='/hoge'>Hoge</Link>);
  t.true(wrapper.matchesElement(<a href='/hoge' target='_self'>Hoge</a>));
});

test('href', t => {
  const wrapper = shallow(<Link href='/foo'>Foo</Link>);
  t.true(wrapper.matchesElement(<a href='/foo' target='_self'>Foo</a>));
});

test('external', t => {
  const wrapper = shallow(<Link external to='http://example.com'>Example</Link>);
  t.true(wrapper.matchesElement(<a href='http://example.com' target='_blank'>Example</a>));
});

test('class', t => {
  const wrapper = shallow(<Link className='ui link' to='/users'>Users</Link>);
  t.true(wrapper.matchesElement(<a href='/users' className='ui link' target='_self'>Users</a>));
});

test('click', t => {
  const ev = td.object(['preventDefault']);
  const dispatch = td.function('dispatch');
  const handler = td.function('handler');
  const wrapper = shallow(<Link to='/users' onClick={handler} dispatch={dispatch}>Link</Link>);
  wrapper.find('a').simulate('click', ev);

  td.verify(ev.preventDefault(), { times: 1 });
  td.verify(handler(ev), { times: 1 });
  td.verify(dispatch(td.matchers.isA(Object)), { times: 1 });
});

test('click + external', t => {
  const handler = td.function('handler');
  const wrapper = shallow(<Link external to='http://external.com' onClick={handler} dispatch={() => {}}>External</Link>);
  wrapper.find('a').simulate('click', { preventDefault: () => {} });

  td.verify(handler(), { times: 0 });
});

test('either "to" or "href"', t => {
  const err = t.throws(() => shallow(<Link>Either</Link>));
  t.is(err.message, "<Link> component requires either 'to' or 'href' props.");
});
