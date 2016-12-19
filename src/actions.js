export const INIT_COMPONENT = 'INIT_COMPONENT';
export const CHANGE_COMPONENT = 'CHANGE_COMPONENT';
export const initComponent = payload => ({ type: INIT_COMPONENT, payload });
export const changeComponent = payload => ({ type: CHANGE_COMPONENT, payload });

export const UPDATE_PATH_INFO = 'UPDATE_PATH_INFO';
export const updatePathInfo = payload => ({ type: UPDATE_PATH_INFO, payload });
