/* eslint-disable */
import { notificationConstants } from '../constants';
import { notificationService } from '../services';
import { alertActions } from '.';

export const notificationActions = {


    /**
     * Consulta para DataTable de notificaciones admin
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTable( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            notificationService.notificationTable( user, pageIndex, pageSize, sortBy, filters )
                .then(
                    data => {
                        dispatch(success(data))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: notificationConstants.NOTIFICATION_TABLE_REQUEST } }
        function success(data) { return { type: notificationConstants.NOTIFICATION_TABLE_SUCCESS, data } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de notificaciones del docente
     * @param {Object} usuario
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTableTeacher( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            notificationService.notificationTableTeacher( user, pageIndex, pageSize, sortBy, filters )
                .then(
                    data => {
                        dispatch(success(data))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: notificationConstants.NOTIFICATION_TABLE_REQUEST } }
        function success(data) { return { type: notificationConstants.NOTIFICATION_TABLE_SUCCESS, data } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de reporte de notificaciones
     * @param {Object} usuario
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
     dataTableReport( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            notificationService.notificationsReport( user, pageIndex, pageSize, sortBy, filters )
                .then(
                    data => {
                        dispatch(success(data))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: notificationConstants.NOTIFICATION_TABLE_REQUEST } }
        function success(data) { return { type: notificationConstants.NOTIFICATION_TABLE_SUCCESS, data } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_TABLE_FAILURE, error } }
    },

    //Resetear data
    clearData() {
        return { type: notificationConstants.CLEAR };
    },

    //Registrar notificación
    createNotification(notification) {
        return dispatch => {
            dispatch(request(notification));

            notificationService.notificationCreate(notification)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la notificación correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: notificationConstants.NOTIFICATION_CREATE_REQUEST } }
        function success() { return { type: notificationConstants.NOTIFICATION_CREATE_SUCCESS } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_CREATE_FAILURE, error } }
    },

    //Actualizar información notificación
    updateNotification(id, notification) {
        return dispatch => {
            dispatch(request(notification));

            notificationService.notificationUpdate(id,notification)
                .then(
                    notification => {
                        dispatch(success(notification));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: notificationConstants.NOTIFICATION_UPDATE_REQUEST, id } }
        function success(notification) { return { type: notificationConstants.NOTIFICATION_UPDATE_SUCCESS, notification } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_UPDATE_FAILURE, error } }
    },

    //Obtener notificacion de usuario
    getNotification(id) {
        return dispatch => {
            dispatch(request(id));

            notificationService.notificationGet(id)
                .then(
                    notification => {
                        dispatch(success(notification));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: notificationConstants.NOTIFICATION_GET_REQUEST, id } }
        function success(notification) { return { type: notificationConstants.NOTIFICATION_GET_SUCCESS, notification } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_GET_FAILURE, error } }
    },

    //Obtener notificacion admin
    getNotificationAdmin(id) {
        return dispatch => {
            dispatch(request(id));

            notificationService.notificationGetAdmin(id)
                .then(
                    notification => {
                        dispatch(success(notification));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: notificationConstants.NOTIFICATION_GET_REQUEST, id } }
        function success(notification) { return { type: notificationConstants.NOTIFICATION_GET_SUCCESS, notification } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_GET_FAILURE, error } }
    },

    //Eliminar notificacion
    removeNotification(id) {
        return dispatch => {
            dispatch(request());

            notificationService.removeNotification(id)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Se eliminó la notificación correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: notificationConstants.NOTIFICATION_DELETE_REQUEST } }
        function success() { return { type: notificationConstants.NOTIFICATION_DELETE_SUCCESS } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_DELETE_FAILURE, error } }
    },

    //Eliminar notificacion
    deleteNotification(id) {
        return dispatch => {
            dispatch(request());

            notificationService.deleteNotification(id)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Se eliminó la notificación correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: notificationConstants.NOTIFICATION_DELETE_REQUEST } }
        function success() { return { type: notificationConstants.NOTIFICATION_DELETE_SUCCESS } }
        function failure(error) { return { type: notificationConstants.NOTIFICATION_DELETE_FAILURE, error } }
    },

};
