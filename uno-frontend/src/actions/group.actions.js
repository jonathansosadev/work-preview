/* eslint-disable */
import { groupConstants } from '../constants';
import { groupService } from '../services';
import { alertActions } from './';

export const groupActions = {

    /**
     * Consulta para DataTable de grupos
     */
    dataTable(pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            groupService.groupTable(pageIndex, pageSize, sortBy, filters)
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

        function request() { return { type: groupConstants.GROUP_TABLE_REQUEST } }
        function success(groups) { return { type: groupConstants.GROUP_TABLE_SUCCESS, groups } }
        function failure(error) { return { type: groupConstants.GROUP_TABLE_FAILURE, error } }
    },

    //Registrar grupo
    createGroup(group) {
        return dispatch => {
            dispatch(request(group));

            groupService.groupCreate(group)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado el grupo correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: groupConstants.GROUP_CREATE_REQUEST } }
        function success() { return { type: groupConstants.GROUP_CREATE_SUCCESS } }
        function failure(error) { return { type: groupConstants.GROUP_CREATE_FAILURE, error } }
    },

    //Resetear data
    clearData() {
        return { type: groupConstants.CLEAR };
    },


    //Eliminar grupo
    deleteGroup(id) {
        return dispatch => {
            dispatch(request(id));

            groupService.groupDelete(id)
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

        function request(id) { return { type: groupConstants.GROUP_DELETE_REQUEST, id } }
        function success() { return { type: groupConstants.GROUP_DELETE_SUCCESS } }
        function failure(error) { return { type: groupConstants.GROUP_DELETE_FAILURE, error } }
    },

    //Obtener sedes para select
    listGroups() {
        return dispatch => {
            dispatch(request());

            groupService.groupList()
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

        function request() { return { type: groupConstants.GROUP_SELECT_REQUEST } }
        function success(list) { return { type: groupConstants.GROUP_SELECT_SUCCESS, list } }
        function failure(error) { return { type: groupConstants.GROUP_SELECT_FAILURE, error } }
    }
};
