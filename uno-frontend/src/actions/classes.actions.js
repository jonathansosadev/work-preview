/* eslint-disable */
import { classesConstants } from '../constants/classes.constants';
import { classService } from '../services/classes.service';
import { alertActions } from '.';

export const classesActions = {

    /**
     * Consulta para DataTable de Clases de profesor
     */
    dataTable(pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            classService.classTable(pageIndex, pageSize, sortBy, filters)
                .then(
                    classes => {
                        dispatch(success(classes))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: classesConstants.CLASSES_TABLE_REQUEST } }
        function success(classes) { return { type: classesConstants.CLASSES_TABLE_SUCCESS, classes } }
        function failure(error) { return { type: classesConstants.CLASSES_TABLE_FAILURE, error } }
    },

    //Crear clase de profesor
    createClasses(data) {
        return dispatch => {
            dispatch(request(data));

            classService.classCreate(data)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Sus datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(data) { return { type: classesConstants.CLASSES_CREATE_REQUEST, data } }
        function success() { return { type: classesConstants.CLASSES_CREATE_SUCCESS } }
        function failure(error) { return { type: classesConstants.CLASSES_CREATE_FAILURE, error } }
    },

    //Resetear data
    clearData() {
        return { type: classesConstants.CLEAR };
    },

    //Eliminar clases
    deleteClasses(id) {
        return dispatch => {
            dispatch(request(id));

            classService.classDelete(id)
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

        function request(id) { return { type: classesConstants.CLASSES_DELETE_REQUEST, id } }
        function success() { return { type: classesConstants.CLASSES_DELETE_SUCCESS } }
        function failure(error) { return { type: classesConstants.CLASSES_DELETE_FAILURE, error } }
    },

    //Actualizar información usuario
    updateClasses(id, data) {
        return dispatch => {
            dispatch(request(id));

            classService.classUpdate(id,data)
                .then(
                    () => {
                        dispatch(success(data.matters));
                        dispatch(alertActions.success('Sus datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: classesConstants.CLASSES_UPDATE_REQUEST, id } }
        function success(matters) { return { type: classesConstants.CLASSES_UPDATE_SUCCESS, matters } }
        function failure(error) { return { type: classesConstants.CLASSES_UPDATE_FAILURE, error } }
    },


    //Obtener todas las materias del docente
    getMatterGroup(idGroup) {
        return dispatch => {
            dispatch(request(idGroup));

            classService.groupMatter(idGroup)
                .then(
                    result => {
                        dispatch(success(result));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: classesConstants.CLASSES_MATTER_REQUEST, id } }
        function success(matters) { return { type: classesConstants.CLASSES_MATTER_SUCCESS, matters } }
        function failure(error) { return { type: classesConstants.CLASSES_MATTER_FAILURE, error } }
    },

};
