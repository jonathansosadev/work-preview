/* eslint-disable */
import { sheduleConstants } from '../constants';
import { sheduleService } from '../services';
import { alertActions } from '.';

export const sheduleActions = {


    /**
     * Consulta para DataTable de calendarios
     */
     dataTable(pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            sheduleService.sheduleTable(pageIndex, pageSize, sortBy, filters)
                .then(
                    groups => {
                        dispatch(success(groups))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: sheduleConstants.SHEDULE_TABLE_REQUEST } }
        function success(shedules) { return { type: sheduleConstants.SHEDULE_TABLE_SUCCESS, shedules } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_TABLE_FAILURE, error } }
    },

    //Registrar calendario
    createShedule(shedule) {
        return dispatch => {
            dispatch(request(shedule));

            sheduleService.sheduleCreate(shedule)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado el calendario correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: sheduleConstants.SHEDULE_CREATE_REQUEST } }
        function success() { return { type: sheduleConstants.SHEDULE_CREATE_SUCCESS } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_CREATE_FAILURE, error } }
    },

    //Obtenr información calendario
    getShedule(id) {
        return dispatch => {
            dispatch(request(id));

            sheduleService.sheduleGet(id)
                .then(
                    shedule => {
                        dispatch(success(shedule));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: sheduleConstants.SHEDULE_GET_REQUEST, id } }
        function success(shedule) { return { type: sheduleConstants.SHEDULE_GET_SUCCESS, shedule } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_GET_FAILURE, error } }
    },

    //Obtenr información calendario por usuario
    getSheduleUser(user) {
        return dispatch => {
            dispatch(request(user));

            sheduleService.sheduleGetUser(user)
                .then(
                    shedule => {
                        dispatch(success(shedule));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(user) { return { type: sheduleConstants.SHEDULE_USER_GET_REQUEST, user } }
        function success(shedule) { return { type: sheduleConstants.SHEDULE_USER_GET_SUCCESS, shedule } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_USER_GET_FAILURE, error } }
    },

    //Actualizar información calendario
    updateShedule(id, shedule) {
        return dispatch => {
            dispatch(request(shedule));

            sheduleService.sheduleUpdate(id,shedule)
                .then(
                    shedule => {
                        dispatch(success(shedule));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: sheduleConstants.SHEDULE_UPDATE_REQUEST, id } }
        function success(shedule) { return { type: sheduleConstants.SHEDULE_UPDATE_SUCCESS, shedule } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_UPDATE_FAILURE, error } }
    },

    //Obtener horarios para select
    listAgencies() {
        return dispatch => {
            dispatch(request());

            sheduleService.sheduleList()
                .then(
                    list => {
                        dispatch(success(list));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: sheduleConstants.SHEDULE_SELECT_REQUEST } }
        function success(list) { return { type: sheduleConstants.SHEDULE_SELECT_SUCCESS, list } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_SELECT_FAILURE, error } }
    },

    //Eliminar grupo
    deleteShedule(id) {
        return dispatch => {
            dispatch(request(id));

            sheduleService.sheduleDelete(id)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Los datos han sido eliminados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: sheduleConstants.SHEDULE_DELETE_REQUEST, id } }
        function success() { return { type: sheduleConstants.SHEDULE_DELETE_SUCCESS } }
        function failure(error) { return { type: sheduleConstants.SHEDULE_DELETE_FAILURE, error } }
    },
};
