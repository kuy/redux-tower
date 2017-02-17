// @flow
export interface Action {
  type: string;
  payload: any;
}

export interface Intercepted {
  type: string;
  payload: any;
  [key: string]: boolean;
}
export type ActionCreator = (type: string) => (payload: any) => Action;
export type CreateActionCreatorArgs = (type: string) => (...args: any) => Action;

export const PREFIX = '@@redux-tower/';

export const INTERCEPTED  = `${PREFIX}INTERCEPTED`;
export const intercepted = (action: Action): Action => ({ ...action, [INTERCEPTED]: true });
export function unprefix(type: string): string {
  if (typeof type !== 'string') {
    throw new Error(`Only accept string, but passed '${typeof type}'`);
  }
  return type.replace(PREFIX, '');
}
export const isPrefixed = (name: string): boolean => name.indexOf(PREFIX) === 0;
export const isTowerAction = (action: Action): boolean => !!(action && action.type && isPrefixed(action.type));
export const isHistoryAction = (action: Action): boolean => !!(action && action.type && HISTORY_ACTIONS.indexOf(action.type) !== -1);
export const isIntercepted = (action: {[key: string]: Function}): boolean => !!(action && action[INTERCEPTED]);

export const createActionCreator: ActionCreator = (type: string) => payload => ({ type, payload });

export const INIT = `${PREFIX}INIT`;
export const CHANGE_ELEMENT = `${PREFIX}CHANGE_ELEMENT`;
export const init = createActionCreator(INIT);
export const changeElement = createActionCreator(CHANGE_ELEMENT);

export const UPDATE_PATH_INFO = `${PREFIX}UPDATE_PATH_INFO`;
export const updatePathInfo = createActionCreator(UPDATE_PATH_INFO);

export const createActionCreatorArgs: CreateActionCreatorArgs = type => (...args) => ({ type, payload: args });

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
