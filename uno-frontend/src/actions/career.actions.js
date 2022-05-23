/* eslint-disable */
import { careerConstants } from '../constants';
import { careerService } from '../services';
import { alertActions } from './';

export const careerActions = {


    /**
     * Consulta para DataTable de carreras
     */
    dataTable( ) {
        return dispatch => {
            dispatch(request());

            careerService.careerTable()
                .then(
                    careers => {
                        dispatch(success(careers))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: careerConstants.CAREER_TABLE_REQUEST } }
        function success(careers) { return { type: careerConstants.CAREER_TABLE_SUCCESS, careers } }
        function failure(error) { return { type: careerConstants.CAREER_TABLE_FAILURE, error } }
    },

    //Registrar carreras
    createCareer(career) {
        return dispatch => {
            dispatch(request(career));

            careerService.careerCreate(career)
                .then(
                    career => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la carrera correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(career) { return { type: careerConstants.CAREER_CREATE_REQUEST, career } }
        function success(career) { return { type: careerConstants.CAREER_CREATE_SUCCESS, career } }
        function failure(error) { return { type: careerConstants.CAREER_CREATE_FAILURE, error } }
    },

    //Obtener información carrera
    getCareer(id) {
        return dispatch => {
            dispatch(request(id));

            careerService.careerGet(id)
                .then(
                    career => {
                        dispatch(success(career));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: careerConstants.CAREER_GET_REQUEST, id } }
        function success(career) { return { type: careerConstants.CAREER_GET_SUCCESS, career } }
        function failure(error) { return { type: careerConstants.CAREER_GET_FAILURE, error } }
    },

    //Actualizar información carrera
    updateCareer(id, career) {
        return dispatch => {
            dispatch(request(career));

            careerService.careerUpdate(id,career)
                .then(
                    career => {
                        dispatch(success(career));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: careerConstants.CAREER_UPDATE_REQUEST, id } }
        function success(career) { return { type: careerConstants.CAREER_UPDATE_SUCCESS, career } }
        function failure(error) { return { type: careerConstants.CAREER_UPDATE_FAILURE, error } }
    },

    //Obtener carreras para select
    listCareers() {
        return dispatch => {
            dispatch(request());

            careerService.careerList()
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

        function request() { return { type: careerConstants.CAREER_SELECT_REQUEST } }
        function success(list) { return { type: careerConstants.CAREER_SELECT_SUCCESS, list } }
        function failure(error) { return { type: careerConstants.CAREER_SELECT_FAILURE, error } }
    }
};
