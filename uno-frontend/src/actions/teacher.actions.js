/* eslint-disable */
import { teacherConstants } from '../constants';
import { teacherService } from '../services';
import { alertActions } from './';

export const teacherActions = {


    /**
     * Consulta para DataTable de profesores
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTable( pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            teacherService.teacherTable( pageIndex, pageSize, sortBy, filters )
                .then(
                    teachers => {
                        dispatch(success(teachers))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: teacherConstants.TEACHER_TABLE_REQUEST } }
        function success(teachers) { return { type: teacherConstants.TEACHER_TABLE_SUCCESS, teachers } }
        function failure(error) { return { type: teacherConstants.TEACHER_TABLE_FAILURE, error } }
    },

    //Resetear data
    clearData() {
        return { type: teacherConstants.CLEAR };
    },

    //Registrar profesores
    createTeacher(teacher) {
        return dispatch => {
            dispatch(request(teacher));

            teacherService.teacherCreate(teacher)
                .then(
                    teacher => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado el docente correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(teacher) { return { type: teacherConstants.TEACHER_CREATE_REQUEST, teacher } }
        function success(teacher) { return { type: teacherConstants.TEACHER_CREATE_SUCCESS, teacher } }
        function failure(error) { return { type: teacherConstants.TEACHER_CREATE_FAILURE, error } }
    },

    //Obtener información profesor
    getTeacher(id) {
        return dispatch => {
            dispatch(request(id));

            teacherService.teacherGet(id)
                .then(
                    teacher => {
                        dispatch(success(teacher));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: teacherConstants.TEACHER_GET_REQUEST, id } }
        function success(teacher) { return { type: teacherConstants.TEACHER_GET_SUCCESS, teacher } }
        function failure(error) { return { type: teacherConstants.TEACHER_GET_FAILURE, error } }
    },

    //Actualizar información profesor
    updateTeacher(id, teacher) {
        return dispatch => {
            dispatch(request(teacher));

            teacherService.teacherUpdate(id,teacher)
                .then(
                    teacher => {
                        dispatch(success(teacher));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: teacherConstants.TEACHER_UPDATE_REQUEST, id } }
        function success(teacher) { return { type: teacherConstants.TEACHER_UPDATE_SUCCESS, teacher } }
        function failure(error) { return { type: teacherConstants.TEACHER_UPDATE_FAILURE, error } }
    },

};
