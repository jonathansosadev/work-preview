/* eslint-disable */
import { adminConstants } from '../constants';
import { adminService } from '../services';
import { alertActions } from '.';

export const adminActions = {


    /**
     * Consulta para DataTable de administradores
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTable( pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            adminService.adminTable( pageIndex, pageSize, sortBy, filters )
                .then(
                    admins => {
                        dispatch(success(admins))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: adminConstants.ADMIN_TABLE_REQUEST } }
        function success(admins) { return { type: adminConstants.ADMIN_TABLE_SUCCESS, admins } }
        function failure(error) { return { type: adminConstants.ADMIN_TABLE_FAILURE, error } }
    },

    //Registrar admin
    createAdmin(admin) {
        return dispatch => {
            dispatch(request(admin));

            adminService.adminCreate(admin)
                .then(
                    admin => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado el administrador correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(admin) { return { type: adminConstants.ADMIN_CREATE_REQUEST, admin } }
        function success(admin) { return { type: adminConstants.ADMIN_CREATE_SUCCESS, admin } }
        function failure(error) { return { type: adminConstants.ADMIN_CREATE_FAILURE, error } }
    },

    //Obtener información admin
    getAdmin(id) {
        return dispatch => {
            dispatch(request(id));

            adminService.adminGet(id)
                .then(
                    admin => {
                        dispatch(success(admin));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: adminConstants.ADMIN_GET_REQUEST, id } }
        function success(admin) { return { type: adminConstants.ADMIN_GET_SUCCESS, admin } }
        function failure(error) { return { type: adminConstants.ADMIN_GET_FAILURE, error } }
    },

    //Actualizar información admin
    updateAdmin(id, admin) {
        return dispatch => {
            dispatch(request(admin));

            adminService.adminUpdate(id,admin)
                .then(
                    admin => {
                        dispatch(success(admin));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: adminConstants.ADMIN_UPDATE_REQUEST, id } }
        function success(admin) { return { type: adminConstants.ADMIN_UPDATE_SUCCESS, admin } }
        function failure(error) { return { type: adminConstants.ADMIN_UPDATE_FAILURE, error } }
    },

};
