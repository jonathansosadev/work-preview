/* eslint-disable */
import { inscriptionConstants } from '../constants';
import { inscriptionService } from '../services';
import { alertActions } from '.';

export const inscriptionActions = {


    /**
     * Consulta para DataTable de inscripcion
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTable( pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            inscriptionService.inscriptionTable( pageIndex, pageSize, sortBy, filters )
                .then(
                    inscriptions => {
                        dispatch(success(inscriptions))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: inscriptionConstants.INSCRIPTION_TABLE_REQUEST } }
        function success(inscriptions) { return { type: inscriptionConstants.INSCRIPTION_TABLE_SUCCESS, inscriptions } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_TABLE_FAILURE, error } }
    },

    //Resetear data
    clearData() {
        return { type: inscriptionConstants.CLEAR };
    },

    //Registrar inscripcion
    createInscription(inscription) {
        return dispatch => {
            dispatch(request(inscription));

            inscriptionService.inscriptionCreate(inscription)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la inscripción correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: inscriptionConstants.INSCRIPTION_CREATE_REQUEST } }
        function success(inscription) { return { type: inscriptionConstants.INSCRIPTION_CREATE_SUCCESS, inscription } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_CREATE_FAILURE, error } }
    },

    //Registrar inscripcion regular (alumnos antiguos)
    createInscriptionRegular(inscription) {
        return dispatch => {
            dispatch(request(inscription));

            inscriptionService.inscriptionCreateRegular(inscription)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la inscripción correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: inscriptionConstants.INSCRIPTION_CREATE_REQUEST } }
        function success(inscription) { return { type: inscriptionConstants.INSCRIPTION_CREATE_SUCCESS, inscription } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_CREATE_FAILURE, error } }
    },

    //Obtener información inscripcion
    getInscription(id) {
        return dispatch => {
            dispatch(request(id));

            inscriptionService.inscriptionGet(id)
                .then(
                    inscription => {
                        dispatch(success(inscription));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: inscriptionConstants.INSCRIPTION_GET_REQUEST, id } }
        function success(inscription) { return { type: inscriptionConstants.INSCRIPTION_GET_SUCCESS, inscription } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_GET_FAILURE, error } }
    },

    //Actualizar información inscripcion
    updateInsciption(id, inscription) {
        return dispatch => {
            dispatch(request(inscription));

            inscriptionService.inscriptionUpdate(id,inscription)
                .then(
                    inscription => {
                        dispatch(success(inscription));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: inscriptionConstants.INSCRIPTION_UPDATE_REQUEST, id } }
        function success(inscription) { return { type: inscriptionConstants.INSCRIPTION_UPDATE_SUCCESS, inscription } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_UPDATE_FAILURE, error } }
    },

    //Obtener información inscripcion
    getDataInscription() {
        return dispatch => {
            dispatch(request());

            inscriptionService.inscriptionData()
                .then(
                    data => {
                        dispatch(success(data));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: inscriptionConstants.INSCRIPTION_DATA_REQUEST } }
        function success(data) { return { type: inscriptionConstants.INSCRIPTION_DATA_SUCCESS, data } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_DATA_FAILURE, error } }
    },

    //eliminar inscripcion
    removeInscription(id, user) {
        return dispatch => {
            dispatch(request(id));
    
            inscriptionService.removeInscription(id, user)
                .then(
                    offers => {
                        dispatch(success(offers));
                        dispatch(alertActions.success('¡Se ha eliminado la inscripción correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };
    
        function request(id) { return { type: inscriptionConstants.INSCRIPTION_DELETE_REQUEST, id } }
        function success() { return { type: inscriptionConstants.INSCRIPTION_DELETE_SUCCESS } }
        function failure(error) { return { type: inscriptionConstants.INSCRIPTION_DELETE_FAILURE, error } }
    },

};
