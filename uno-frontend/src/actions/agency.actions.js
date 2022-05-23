/* eslint-disable */
import { agencyConstants } from '../constants';
import { agencyService } from '../services';
import { alertActions } from './';

export const agencyActions = {


    /**
     * Consulta para DataTable de sedes
     */
    dataTable() {
        return dispatch => {
            dispatch(request());

            agencyService.agencyTable()
                .then(
                    agencies => {
                        dispatch(success(agencies))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: agencyConstants.AGENCY_TABLE_REQUEST } }
        function success(agencies) { return { type: agencyConstants.AGENCY_TABLE_SUCCESS, agencies } }
        function failure(error) { return { type: agencyConstants.AGENCY_TABLE_FAILURE, error } }
    },

    //Registrar sede
    createAgency(agency) {
        return dispatch => {
            dispatch(request(agency));

            agencyService.agencyCreate(agency)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la sede correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: agencyConstants.AGENCY_CREATE_REQUEST } }
        function success() { return { type: agencyConstants.AGENCY_CREATE_SUCCESS } }
        function failure(error) { return { type: agencyConstants.AGENCY_CREATE_FAILURE, error } }
    },

    //Obtenr información sede
    getAgency(id) {
        return dispatch => {
            dispatch(request(id));

            agencyService.agencyGet(id)
                .then(
                    agency => {
                        dispatch(success(agency));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: agencyConstants.AGENCY_GET_REQUEST, id } }
        function success(agency) { return { type: agencyConstants.AGENCY_GET_SUCCESS, agency } }
        function failure(error) { return { type: agencyConstants.AGENCY_GET_FAILURE, error } }
    },

    //Actualizar información sede
    updateAgency(id, agency) {
        return dispatch => {
            dispatch(request(agency));

            agencyService.agencyUpdate(id,agency)
                .then(
                    agency => {
                        dispatch(success(agency));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: agencyConstants.AGENCY_UPDATE_REQUEST, id } }
        function success(agency) { return { type: agencyConstants.AGENCY_UPDATE_SUCCESS, agency } }
        function failure(error) { return { type: agencyConstants.AGENCY_UPDATE_FAILURE, error } }
    },

    //Obtener sedes para select
    listAgencies() {
        return dispatch => {
            dispatch(request());

            agencyService.agencyList()
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

        function request() { return { type: agencyConstants.AGENCY_SELECT_REQUEST } }
        function success(list) { return { type: agencyConstants.AGENCY_SELECT_SUCCESS, list } }
        function failure(error) { return { type: agencyConstants.AGENCY_SELECT_FAILURE, error } }
    }
};
