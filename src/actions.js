export const PREFIX = '@@redux-tower/';

export const INTERCEPTED = `${PREFIX}INTERCEPTED`;
export const intercepted = action => ({ ...action, [INTERCEPTED]: true });
export function unprefix(type) {
  if (typeof type !== 'string') {
    throw new Error(`Only accept string, but passed '${typeof type}'`);
  }
  return type.replace(PREFIX, '');
}
export const isTowerAction = action => !!(action && action.type && action.type.indexOf(PREFIX) === 0);
export const isHistoryAction = action => !!(action && action.type && HISTORY_ACTIONS.indexOf(action.type) !== -1);
export const isIntercepted = action => !!(action && action[INTERCEPTED]);

export const createActionCreator = type => payload => ({ type, payload });

export const INIT = `${PREFIX}INIT`;
export const CHANGE_COMPONENT = `${PREFIX}CHANGE_COMPONENT`;
export const init = createActionCreator(INIT);
export const changeComponent = createActionCreator(CHANGE_COMPONENT);

export const UPDATE_PATH_INFO = `${PREFIX}UPDATE_PATH_INFO`;
export const updatePathInfo = createActionCreator(UPDATE_PATH_INFO);

export const createActionCreatorArgs = type => (...args) => ({ type, payload: args });

export const PUSH = `${PREFIX}PUSH`;
export const REPLACE = `${PREFIX}REPLACE`;
export const GO = `${PREFIX}GO`;
export const GO_BACK = `${PREFIX}GO_BACK`;
export const GO_FORWARD = `${PREFIX}GO_FORWARD`;
export const push = createActionCreatorArgs(PUSH);
export const replace = createActionCreatorArgs(REPLACE);
export const go = createActionCreatorArgs(GO);
export const goBack = createActionCreatorArgs(GO_BACK);
export const goForward = createActionCreatorArgs(GO_FORWARD);

export const HISTORY_ACTIONS = [PUSH, REPLACE, GO, GO_BACK, GO_FORWARD];
