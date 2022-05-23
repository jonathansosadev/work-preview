/* eslint-disable */
import { referenceConstants } from '../constants';
import { referenceService } from '../services';
import { alertActions } from '.';

export const referenceActions = {


    /**
     * Consulta para DataTable de referencias
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTable( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            referenceService.referenceTable( user, pageIndex, pageSize, sortBy, filters )
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

        function request() { return { type: referenceConstants.REFERENCE_TABLE_REQUEST } }
        function success(data) { return { type: referenceConstants.REFERENCE_TABLE_SUCCESS, data } }
        function failure(error) { return { type: referenceConstants.REFERENCE_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de estudiantes y referencias
     * @param {Object} usuario
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTableStudent( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            referenceService.referenceTableStudent( user, pageIndex, pageSize, sortBy, filters )
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

        function request() { return { type: referenceConstants.REFERENCE_TABLE_REQUEST } }
        function success(data) { return { type: referenceConstants.REFERENCE_TABLE_SUCCESS, data } }
        function failure(error) { return { type: referenceConstants.REFERENCE_TABLE_FAILURE, error } }
    },


    //Obtener información calificacion
    getReference(id) {
        return dispatch => {
            dispatch(request(id));

            referenceService.referenceGet(id)
                .then(
                    reference => {
                        dispatch(success(reference));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: referenceConstants.REFERENCE_GET_REQUEST, id } }
        function success(reference) { return { type: referenceConstants.REFERENCE_GET_SUCCESS, reference } }
        function failure(error) { return { type: referenceConstants.REFERENCE_GET_FAILURE, error } }
    },

    //Actualizar referencia
    updateReference(id, data) {
        return dispatch => {
            dispatch(request(data));

            referenceService.referenceUpdate(id,data)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: referenceConstants.REFERENCE_UPDATE_REQUEST } }
        function success() { return { type: referenceConstants.REFERENCE_UPDATE_SUCCESS } }
        function failure(error) { return { type: referenceConstants.REFERENCE_UPDATE_FAILURE, error } }
    },

};
