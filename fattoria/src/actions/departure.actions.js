/* eslint-disable */
import { departureConstants } from '../constants';
import { departureService } from '../services';
import { alertActions } from './';

export const departureActions = {

    dataTable(user, pageIndex, pageSize, sortBy, filters, isExcel) {
        return dispatch => {
            dispatch(request());

            departureService.departureTable(user, pageIndex, pageSize, sortBy, filters, isExcel)
                .then(
                    departure => {
                        dispatch(success(departure))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: departureConstants.DEPARTURE_TABLE_REQUEST } }
        function success(departure) { return { type: departureConstants.DEPARTURE_TABLE_SUCCESS, departure } }
        function failure(error) { return { type: departureConstants.DEPARTURE_TABLE_FAILURE, error } }
    },

    //Registrar salida
    createDeparture(departure) {
        return dispatch => {
            dispatch(request(departure));

            departureService.departureCreate(departure)
                .then(
                    sale => { 
                        dispatch(success(sale));
                        dispatch(alertActions.success('¡Se ha registrado la salida correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(departure) { return { type: departureConstants.DEPARTURE_CREATE_REQUEST, departure } }
        function success(sale) { return { type: departureConstants.DEPARTURE_CREATE_SUCCESS, sale } }
        function failure(error) { return { type: departureConstants.DEPARTURE_CREATE_FAILURE, error } }
    },

    //Obtenr información salida
    getDeparture(id) {
        return dispatch => {
            dispatch(request(id));

            departureService.departureGet(id)
                .then(
                    departure => {
                        dispatch(success(departure));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: departureConstants.DEPARTURE_GET_REQUEST, id } }
        function success(departure) { return { type: departureConstants.DEPARTURE_GET_SUCCESS, departure } }
        function failure(error) { return { type: departureConstants.DEPARTURE_GET_FAILURE, error } }
    },

    listDeparture() {
        return dispatch => {
            dispatch(request());

            departureService.departureList()
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

        function request() { return { type: departureConstants.DEPARTURE_SELECT_REQUEST } }
        function success(list) { return { type: departureConstants.DEPARTURE_SELECT_SUCCESS, list } }
        function failure(error) { return { type: departureConstants.DEPARTURE_SELECT_FAILURE, error } }
    },

};
