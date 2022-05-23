/* eslint-disable */
import { userConstants } from '../constants';
import { userService } from '../services';
import { alertActions } from './';
import { history } from '../helpers';
export const userActions = {
    login,
    logout,
    register,
    confirmEmail,
    forgot,
    reset,
    restore,
    getAll,
    update,
    uploadProfiePic,
    delete: _delete,
    updatePwd
};

//Autenticación
function login(email, password) {
    return dispatch => {
        dispatch(request({ email }));

        userService.login(email, password)
            .then(
                user => { 
                    dispatch(success(user));
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
}

//Salir del sistema
function logout() {
    userService.logout();
    return { type: userConstants.LOGOUT };
}

//Registro
function register(user) {
    return dispatch => {
        dispatch(request(user));

        userService.register(user)
            .then(
                user => { 
                    dispatch(success());
                    history.push('/');
                    dispatch(alertActions.success('¡Se ha enviado un email a tu correo para la activación!'));
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
}

//Confirmación de correo
function confirmEmail(token) {
    return dispatch => {
        dispatch(request(token));

        userService.confirmEmail(token)
            .then(
                () => { 
                    dispatch(success());
                    history.push('/');
                    dispatch(alertActions.success('La cuenta ha sido verificada. Por favor inicie sesión'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(token) { return { type: userConstants.EMAIL_CONFIRM_REQUEST, token } }
    function success(token) { return { type: userConstants.EMAIL_CONFIRM_SUCCESS, token } }
    function failure(error) { return { type: userConstants.EMAIL_CONFIRM_FAILURE, error } }
}

//Enviar email para restaurar contraseña
function forgot(email) {
    return dispatch => {
        dispatch(request());

        userService.forgot(email)
            .then(
                () => { 
                    dispatch(success());
                    history.push('/');
                    dispatch(alertActions.success('Se ha enviado un email a su cuenta para recuperar la contraseña'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request() { return { type: userConstants.FORGOT_REQUEST } }
    function success() { return { type: userConstants.FORGOT_SUCCESS } }
    function failure(error) { return { type: userConstants.FORGOT_SUCCESS, error } }
}

//Comprobar token para restrablecer contraseña
function reset(token) {
    return dispatch => {
        dispatch(request());

        userService.reset(token)
            .then(
                () => { 
                    dispatch(success());
                    history.push(`/restore/${token}`);
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request() { return { type: userConstants.RESET_REQUEST } }
    function success() { return { type: userConstants.RESET_SUCCESS } }
    function failure(error) { return { type: userConstants.RESET_FAILURE, error } }
}

//Actualizar contraseña
function restore(token, user) {
    return dispatch => {
        dispatch(request());

        userService.restorePassword(token, user)
            .then(
                () => { 
                    dispatch(success());
                    history.push('/');
                    dispatch(alertActions.success('Se ha actualizado correctamente. Por favor inicie sesión'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request() { return { type: userConstants.RESTORE_REQUEST } }
    function success() { return { type: userConstants.RESTORE_SUCCESS } }
    function failure(error) { return { type: userConstants.RESTORE_FAILURE, error } }
}

function getAll() {
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
}

//Actualizar información usuario
function update(id, data) {
    return dispatch => {
        dispatch(request(id));

        userService.update(id,data)
            .then(
                user => {
                    dispatch(success(user));
                    dispatch(updateStorage(user));
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
    function updateStorage(user) { return { type: userConstants.UPDATE_STORAGE, user } }
    function failure(error) { return { type: userConstants.UPDATE_DATA_FAILURE, error } }
}

//Actualizar password usuario
function updatePwd(id, data) {
    return dispatch => {
        dispatch(request(id));

        userService.updatePwd(id,data)
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
}

//Subir imagen de perfil
function uploadProfiePic(id, file) {
    return dispatch => {
        dispatch(request(id));

        userService.uploadImage(id,file)
            .then(
                user => {
                    dispatch(success(user));
                    dispatch(alertActions.success('Sus datos han sido actualizados correctamente'));
                },
                error => {
                    console.log(error);
                    dispatch(failure(error.toString()));
                    dispatch(alertActions.error(error.toString()));
                }
            );
    };

    function request(id) { return { type: userConstants.UPLOAD_IMAGE_REQUEST, id } }
    function success(user) { return { type: userConstants.UPLOAD_IMAGE_SUCCESS, user } }
    function failure(error) { return { type: userConstants.UPLOAD_IMAGE_FAILURE, error } }
}

function _delete(id) {
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
}