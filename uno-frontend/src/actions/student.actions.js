/* eslint-disable */
import { studentConstants } from '../constants';
import { studentService } from '../services';
import { alertActions } from '.';

export const studentActions = {

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

            studentService.studentTable( pageIndex, pageSize, sortBy, filters )
                .then(
                    students => {
                        dispatch(success(students))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: studentConstants.STUDENT_TABLE_REQUEST } }
        function success(students) { return { type: studentConstants.STUDENT_TABLE_SUCCESS, students } }
        function failure(error) { return { type: studentConstants.STUDENT_TABLE_FAILURE, error } }
    },

    //Resetear data
    clearData() {
        return { type: studentConstants.CLEAR };
    },

    //Obtener información profesor
    getTeacher(id) {
        return dispatch => {
            dispatch(request(id));

            studentService.studentGet(id)
                .then(
                    student => {
                        dispatch(success(student));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: studentConstants.STUDENT_GET_REQUEST, id } }
        function success(student) { return { type: studentConstants.STUDENT_GET_SUCCESS, student } }
        function failure(error) { return { type: studentConstants.STUDENT_GET_FAILURE, error } }
    },

    //Actualizar información profesor
    updateStudent(id, student) {
        return dispatch => {
            dispatch(request(student));

            studentService.studentUpdate(id,student)
                .then(
                    student => {
                        dispatch(success(student));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: studentConstants.STUDENT_UPDATE_REQUEST, id } }
        function success(student) { return { type: studentConstants.STUDENT_UPDATE_SUCCESS, student } }
        function failure(error) { return { type: studentConstants.STUDENT_UPDATE_FAILURE, error } }
    },

};
