/* eslint-disable */
import { matterConstants } from '../constants';
import { matterService } from '../services';
import { alertActions } from './';

export const matterActions = {


    /**
     * Consulta para DataTable de materias
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} globalFilter: filtro global
     */
    dataTable() {
        return dispatch => {
            dispatch(request());

            matterService.matterTable()
                .then(
                    matters => {
                        dispatch(success(matters))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: matterConstants.MATTER_TABLE_REQUEST } }
        function success(matters) { return { type: matterConstants.MATTER_TABLE_SUCCESS, matters } }
        function failure(error) { return { type: matterConstants.MATTER_TABLE_FAILURE, error } }
    },

    //Registrar materias
    createMatter(matter) {
        return dispatch => {
            dispatch(request(matter));

            matterService.matterCreate(matter)
                .then(
                    matter => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la materia correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(matter) { return { type: matterConstants.MATTER_CREATE_REQUEST, matter } }
        function success(matter) { return { type: matterConstants.MATTER_CREATE_SUCCESS, matter } }
        function failure(error) { return { type: matterConstants.MATTER_CREATE_FAILURE, error } }
    },

    //Obtener información materia
    getMatter(id) {
        return dispatch => {
            dispatch(request(id));

            matterService.matterGet(id)
                .then(
                    matter => {
                        dispatch(success(matter));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: matterConstants.MATTER_GET_REQUEST, id } }
        function success(matter) { return { type: matterConstants.MATTER_GET_SUCCESS, matter } }
        function failure(error) { return { type: matterConstants.MATTER_GET_FAILURE, error } }
    },

    //Obtener información materia
    getMatterAll() {
        return dispatch => {
            dispatch(request());

            matterService.matterAll()
                .then(
                    matter => {
                        dispatch(success(matter));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: matterConstants.MATTER_GET_REQUEST } }
        function success(matter) { return { type: matterConstants.MATTER_GET_SUCCESS, matter } }
        function failure(error) { return { type: matterConstants.MATTER_GET_FAILURE, error } }
    },

    //Actualizar información materia
    updateMatter(id, matter) {
        return dispatch => {
            dispatch(request(matter));

            matterService.matterUpdate(id,matter)
                .then(
                    matter => {
                        dispatch(success(matter));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: matterConstants.MATTER_UPDATE_REQUEST, id } }
        function success(matter) { return { type: matterConstants.MATTER_UPDATE_SUCCESS, matter } }
        function failure(error) { return { type: matterConstants.MATTER_UPDATE_FAILURE, error } }
    }
};
