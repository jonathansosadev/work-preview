/* eslint-disable */
import { agencyConstants } from '../constants';
import { agencyService } from '../services';
import { alertActions, salesActions } from './';

export const agencyActions = {

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
                    agency => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la sede correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(agency) { return { type: agencyConstants.AGENCY_CREATE_REQUEST, agency } }
        function success(agency) { return { type: agencyConstants.AGENCY_CREATE_SUCCESS, agency } }
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
    updateAgency(id, agency, user) {
        return dispatch => {
            dispatch(request(agency));

            agencyService.agencyUpdate(id,agency)
                .then(
                    agency => {
                        dispatch(success(agency));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));

                        //Si es la misma sucursal actualizar data
                        if(user.agency.id == id){
                            //Actualizar en el storage venta, monedas, productos y terminales de la sucursal 
                            dispatch(salesActions.salesDataFormUpdate( user.agency.id ));
                        }
                       
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
