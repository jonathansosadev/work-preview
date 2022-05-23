/* eslint-disable */
import { logEmailsConstants } from '../constants';
import { logEmailService } from '../services';
import { alertActions } from './';

export const logEmailActions = {


    /**
     * Consulta para DataTable de logs emails
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTable( pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            logEmailService.logEmailTable( pageIndex, pageSize, sortBy, filters )
                .then(
                    logsEmail => {
                        dispatch(success(logsEmail))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: logEmailsConstants.LOG_EMAIL_TABLE_REQUEST } }
        function success(logsEmail) { return { type: logEmailsConstants.LOG_EMAIL_TABLE_SUCCESS, logsEmail } }
        function failure(error) { return { type: logEmailsConstants.LOG_EMAIL_TABLE_FAILURE, error } }
    },

};
