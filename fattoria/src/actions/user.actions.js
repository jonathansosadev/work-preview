/* eslint-disable */
import { userConstants, downloadConstants } from '../constants';
import { userService } from '../services';
import { alertActions, dataActions } from './';
import { history } from '../helpers';

export const userActions = {
    login(username, password) {
        return dispatch => {
            dispatch(request({ username }));
    
            userService.login(username, password)
                .then(
                    user => { 
                        dispatch(success(user.user));
                        //actualizar en redux monedas productos y terminales
                        dispatch(dataActions.update(user.data))
                        history.push('/home');
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };
    
        function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
        function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
        function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
    },
    
    logout() {
        userService.logout();
        return { type: userConstants.LOGOUT };
    },
    
    register(user) {
        return dispatch => {
            dispatch(request(user));
    
            userService.register(user)
                .then(
                    user => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Registro exitoso!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };
    
        function request(user) { return { type: userConstants.REGISTER_REQUEST, user } }
        function success(user) { return { type: userConstants.REGISTER_SUCCESS, user } }
        function failure(error) { return { type: userConstants.REGISTER_FAILURE, error } }
    },
    
    getAll() {
        return dispatch => {
            dispatch(request());
    
            userService.getAll()
                .then(
                    users => dispatch(success(users)),
                    error => dispatch(failure(error.toString()))
                );
        };
    
        function request() { return { type: userConstants.GETALL_REQUEST } }
        function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
        function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
    },
    
    _delete(id) {
        return dispatch => {
            dispatch(request(id));
    
            userService.delete(id)
                .then(
                    user => dispatch(success(id)),
                    error => dispatch(failure(id, error.toString()))
                );
        };
    
        function request(id) { return { type: userConstants.DELETE_REQUEST, id } }
        function success(id) { return { type: userConstants.DELETE_SUCCESS, id } }
        function failure(id, error) { return { type: userConstants.DELETE_FAILURE, id, error } }
    },
    
    //Actualizar información usuario
    update(id, data) {
        return dispatch => {
            dispatch(request(id));
    
            userService.update(id,data)
                .then(
                    user => {
                        dispatch(success(user));
                        dispatch(alertActions.success('Sus datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };
    
        function request(id) { return { type: userConstants.UPDATE_DATA_REQUEST, id } }
        function success(user) { return { type: userConstants.UPDATE_DATA_SUCCESS, user } }
        function failure(error) { return { type: userConstants.UPDATE_DATA_FAILURE, error } }
    },

    //editar info usuario (solo admin)
    updateUser(id, data) {
        return dispatch => {
            dispatch(request(id));
    
            userService.updateUserData(id,data)
                .then(
                    user => {
                        dispatch(success(user));
                        dispatch(alertActions.success('Sus datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };
    
        function request(id) { return { type: userConstants.UPDATE_DATA_REQUEST, id } }
        function success(user) { return { type: userConstants.UPDATE_DATA_SUCCESS, user } }
        function failure(error) { return { type: userConstants.UPDATE_DATA_FAILURE, error } }
    },

    //editar info cliente
    updateClient(id, data) {
        return dispatch => {
            dispatch(request(id));
    
            userService.updateClientData(id,data)
                .then(
                    user => {
                        dispatch(success(user));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };
    
        function request(id) { return { type: userConstants.UPDATE_DATA_REQUEST, id } }
        function success(user) { return { type: userConstants.UPDATE_DATA_SUCCESS, user } }
        function failure(error) { return { type: userConstants.UPDATE_DATA_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de usuarios
     */
    dataTable(user) {
        return dispatch => {
            dispatch(request());

            userService.usersTable(user)
                .then(
                    users => {
                        dispatch(success(users))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: userConstants.USER_TABLE_REQUEST } }
        function success(users) { return { type: userConstants.USER_TABLE_SUCCESS, users } }
        function failure(error) { return { type: userConstants.USER_TABLE_FAILURE, error } }
    },

    //Obtener información usuario
    getUser(id) {
        return dispatch => {
            dispatch(request(id));

            userService.getById(id)
                .then(
                    user => {
                        dispatch(success(user));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: userConstants.USER_GET_REQUEST, id } }
        function success(user) { return { type: userConstants.USER_GET_SUCCESS, user } }
        function failure(error) { return { type: userConstants.USER_GET_FAILURE, error } }
    },

    //Obtener información de cliente
    getClient(id) {
        return dispatch => {
            dispatch(request(id));

            userService.getClientById(id)
                .then(
                    user => {
                        dispatch(success(user));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: userConstants.USER_GET_REQUEST, id } }
        function success(user) { return { type: userConstants.USER_GET_SUCCESS, user } }
        function failure(error) { return { type: userConstants.USER_GET_FAILURE, error } }
    },


    /**
     * Obtener listado de usuarios y sucursales
     * @param {*} user 
     */
    getListUserAgencies(user) {
        return dispatch => {
            dispatch(request(user));

            userService.usersList(user)
                .then(
                    users => {
                        dispatch(success(users));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(user) { return { type: userConstants.USER_LIST_REQUEST, user } }
        function success(users) { return { type: userConstants.USER_LIST_SUCCESS, users } }
        function failure(error) { return { type: userConstants.USER_LIST_FAILURE, error } }
    },

    //Listado de clientes
    clientsList(user, pageIndex, pageSize, sortBy, filters, isExcel) {
        return dispatch => {
            dispatch(request());

            userService.clientsList(user, pageIndex, pageSize, sortBy, filters, isExcel)
                .then(
                    users => {
                        dispatch(success(users))
                        if(isExcel){
                            dispatch(reset())
                        }
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: !isExcel ? userConstants.USER_TABLE_REQUEST: downloadConstants.EXCEL_TABLE_REQUEST } }
        function success(users) { 
            if(!isExcel){
                return { type: userConstants.USER_TABLE_SUCCESS, users }
            }else{
                let data = users;
                return { type: downloadConstants.EXCEL_TABLE_SUCCESS, data }
            }
        }
        function reset() { return { type: downloadConstants.EXCEL_TABLE_RESET } }
        function failure(error) { return { type: !isExcel ? userConstants.USER_TABLE_FAILURE: downloadConstants.EXCEL_TABLE_FAILURE, error } }
    },


    /**
     * Obtener listado de clientes
     * @param {*} client 
     */
    getListClientTypeahead(user) {
        return dispatch => {
            dispatch(request(user));

            userService.clientTypeahead(user)
                .then(
                    users => {
                        dispatch(success(users));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(user) { return { type: userConstants.USER_LIST_REQUEST, user } }
        function success(users) { return { type: userConstants.USER_LIST_SUCCESS, users } }
        function failure(error) { return { type: userConstants.USER_LIST_FAILURE, error } }
    },
};

