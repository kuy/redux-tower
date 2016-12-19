const createActionCreator = type => payload => ({ type, payload });

export const INIT = '@@redux-saga-tower/INIT';
export const CHANGE_PAGE = '@@redux-saga-tower/CHANGE_PAGE';
export const init = createActionCreator(INIT);
export const changePage = createActionCreator(CHANGE_PAGE);

export const UPDATE_PATH_INFO = '@@redux-saga-tower/UPDATE_PATH_INFO';
export const updatePathInfo = createActionCreator(UPDATE_PATH_INFO);

const createActionCreatorArgs = type => (...args) => ({ type, payload: args });

export const PUSH = 'PUSH';
export const REPLACE = 'REPLACE';
export const GO = 'GO';
export const GO_BACK = 'GO_BACK';
export const GO_FORWARD = 'GO_FORWARD';
export const push = createActionCreatorArgs(PUSH);
export const replace = createActionCreatorArgs(REPLACE);
export const go = createActionCreatorArgs(GO);
export const goBack = createActionCreatorArgs(GO_BACK);
export const goForward = createActionCreatorArgs(GO_FORWARD);
