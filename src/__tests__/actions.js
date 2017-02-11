import test from 'ava';
import * as actions from '../actions';

test('intercepted', t => {
  t.deepEqual(
    actions.intercepted({ type: 'HOGE', payload: 10 }),
    { type: 'HOGE', payload: 10, '@@redux-tower/INTERCEPTED': true }
  );
  t.deepEqual(
    actions.intercepted({ type: 'PPAP', payload: 10, '@@redux-tower/INTERCEPTED': false }),
    { type: 'PPAP', payload: 10, '@@redux-tower/INTERCEPTED': true }
  );
});

test('unprefix', t => {
  t.is(actions.unprefix('@@redux-tower/PUSH'), 'PUSH');
  t.is(actions.unprefix('@@redux-whatever/POP'), '@@redux-whatever/POP');
  t.is(actions.unprefix('HOGE'), 'HOGE');
  t.is(actions.unprefix(''), '');

  let error = t.throws(() =>
    actions.unprefix(100)
  );
  t.is(error.message, `Only accept string, but passed '${'number'}'`);

  error = t.throws(() =>
    actions.unprefix()
  );
  t.is(error.message, `Only accept string, but passed '${'undefined'}'`);
});

test('isTowerAction', t => {
  t.true(actions.isTowerAction({ type: '@@redux-tower/CHANGE_ELEMENT' }));
  t.true(actions.isTowerAction({ type: '@@redux-tower/PUSH' }));
  t.false(actions.isTowerAction({ type: '@@redux-whatever/POP' }));
  t.false(actions.isTowerAction({ type: 'HOGE' }));
  t.false(actions.isTowerAction({ payload: 100 }));
  t.false(actions.isTowerAction({}));
  t.false(actions.isTowerAction());
});

test('isHistoryAction', t => {
  t.true(actions.isHistoryAction({ type: '@@redux-tower/PUSH' }));
  t.true(actions.isHistoryAction({ type: '@@redux-tower/REPLACE' }));
  t.true(actions.isHistoryAction({ type: '@@redux-tower/GO' }));
  t.true(actions.isHistoryAction({ type: '@@redux-tower/GO_BACK' }));
  t.true(actions.isHistoryAction({ type: '@@redux-tower/GO_FORWARD' }));
  t.false(actions.isHistoryAction({ type: '@@redux-tower/INIT' }));
  t.false(actions.isHistoryAction({ type: '@@redux-tower/CHANGE_ELEMENT' }));
  t.false(actions.isHistoryAction({ type: '@@redux-whatever/POP' }));
  t.false(actions.isHistoryAction({ type: 'HOGE' }));
  t.false(actions.isHistoryAction({ type: true }));
  t.false(actions.isHistoryAction({ payload: 100 }));
});

test('isIntercepted', t => {
  t.true(actions.isIntercepted({ '@@redux-tower/INTERCEPTED': true }));
  t.false(actions.isIntercepted({ '@@redux-tower/INTERCEPTED': false }));
  t.false(actions.isIntercepted({ '@@redux-whatever/INTERCEPTED': true }));
  t.false(actions.isIntercepted({ type: 'HOGE' }));
  t.false(actions.isIntercepted({}));
  t.false(actions.isIntercepted());
});

test('createActionCreator', t => {
  t.deepEqual(actions.createActionCreator('HOGE')(false), { type: 'HOGE', payload: false });
  t.deepEqual(actions.createActionCreator('HOGE')(1, 2, 3), { type: 'HOGE', payload: 1 });
  t.deepEqual(actions.createActionCreator('HOGE')(), { type: 'HOGE', payload: undefined });
});

test('createActionCreatorArgs', t => {
  t.deepEqual(actions.createActionCreatorArgs('NYAN')(1, 2, 3), { type: 'NYAN', payload: [1, 2, 3] });
  t.deepEqual(actions.createActionCreatorArgs('NYAN')(''), { type: 'NYAN', payload: [''] });
  t.deepEqual(actions.createActionCreatorArgs('NYAN')(), { type: 'NYAN', payload: [] });
});
