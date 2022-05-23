/* eslint-disable */
import { scoreConstants } from '../constants';
import { scoreService } from '../services';
import { alertActions } from '.';

export const scoreActions = {


    /**
     * Consulta para DataTable de calificaciones kardex
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTableKardex( user, career ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreTableKardex( user, career )
                .then(
                    scores => {
                        dispatch(success(scores));
                        if(scores.results.length==0){
                            dispatch(alertActions.success('No es posible generar la información en estos momentos'));
                        }
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.SCORE_TABLE_REQUEST } }
        function success(scores) { return { type: scoreConstants.SCORE_TABLE_SUCCESS, scores } }
        function failure(error) { return { type: scoreConstants.SCORE_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable para boleta de calificaciones
     * @param {*} user estudiante
     * @param {*} career carrera
     * @param {*} quarter cuatrimestre
     * @returns 
     */
    dataTableReportScore( user, career, quarter ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreReportTable( user, career, quarter )
                .then(
                    scores => {
                        dispatch(success(scores));
                        if(scores.results.length==0){
                            dispatch(alertActions.success('No es posible generar la información en estos momentos'));
                        }
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.SCORE_TABLE_REQUEST } }
        function success(scores) { return { type: scoreConstants.SCORE_TABLE_SUCCESS, scores } }
        function failure(error) { return { type: scoreConstants.SCORE_TABLE_FAILURE, error } }
    },

    //Resetear data kardex
    clearData() {
        return { type: scoreConstants.CLEAR };
    },

    /**
     * Consulta para DataTable de estudiantes y calificaciones
     * @param {Object} usuario
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    dataTableStudent( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreTableStudent( user, pageIndex, pageSize, sortBy, filters )
                .then(
                    data => {
                        dispatch(success(data))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.STUDENT_TABLE_REQUEST } }
        function success(data) { return { type: scoreConstants.STUDENT_TABLE_SUCCESS, data } }
        function failure(error) { return { type: scoreConstants.STUDENT_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de estudiantes y calificaciones
     * @param {Object} id de estudiante, materias y id de inscripcion
     */
    dataTableScoreAssign( params ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreTableAssign( params )
                .then(
                    scores => {
                        dispatch(success(scores))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.ASSIGN_TABLE_REQUEST } }
        function success(scores) { return { type: scoreConstants.ASSIGN_TABLE_SUCCESS, scores } }
        function failure(error) { return { type: scoreConstants.ASSIGN_TABLE_FAILURE, error } }
    },

    //Obtener información calificacion
    getScore(id) {
        return dispatch => {
            dispatch(request(id));

            scoreService.scoreGet(id)
                .then(
                    score => {
                        dispatch(success(score));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: scoreConstants.SCORE_GET_REQUEST, id } }
        function success(score) { return { type: scoreConstants.SCORE_GET_SUCCESS, score } }
        function failure(error) { return { type: scoreConstants.SCORE_GET_FAILURE, error } }
    },

    //Actualizar información notas
    updateScore(id, params) {
        return dispatch => {
            dispatch(request(params));

            scoreService.scoreUpdate(id,params)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.SCORE_UPDATE_REQUEST } }
        function success() { return { type: scoreConstants.SCORE_UPDATE_SUCCESS } }
        function failure(error) { return { type: scoreConstants.SCORE_UPDATE_FAILURE, error } }
    },

    //Obtener notas por estudiante
    dataScoresStudent( user, pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreStudent( user, pageIndex, pageSize, sortBy, filters )
                .then(
                    scores => {
                        dispatch(success(scores))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.SCORE_STUDENT_REQUEST } }
        function success(scores) { return { type: scoreConstants.SCORE_STUDENT_SUCCESS, scores } }
        function failure(error) { return { type: scoreConstants.SCORE_STUDENT_FAILURE, error } }
    },

    //Obtener historial de notas
    dataScoresLog( pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreLog( pageIndex, pageSize, sortBy, filters )
                .then(
                    scores => {
                        dispatch(success(scores))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.SCORE_STUDENT_REQUEST } }
        function success(scores) { return { type: scoreConstants.SCORE_STUDENT_SUCCESS, scores } }
        function failure(error) { return { type: scoreConstants.SCORE_STUDENT_FAILURE, error } }
    },

    //Obtener notas (admin)
    dataScores( pageIndex, pageSize, sortBy, filters ) {
        return dispatch => {
            dispatch(request());

            scoreService.scoreAdmin( pageIndex, pageSize, sortBy, filters )
                .then(
                    scores => {
                        dispatch(success(scores))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: scoreConstants.SCORE_ADMIN_REQUEST } }
        function success(scores) { return { type: scoreConstants.SCORE_ADMIN_SUCCESS, scores } }
        function failure(error) { return { type: scoreConstants.SCORE_ADMIN_FAILURE, error } }
    },

    //Consultar carreras de estudiante
    getStudentCareer(idStudent) {
        return dispatch => {
            dispatch(request(idStudent));

            scoreService.getStudentCareer(idStudent)
                .then(
                    (list) => {
                        dispatch(success(list));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(idStudent) { return { type: scoreConstants.CAREER_STUDENT_REQUEST, idStudent } }
        function success(list) { return { type: scoreConstants.CAREER_STUDENT_SUCCESS, list } }
        function failure(error) { return { type: scoreConstants.CAREER_STUDENT_FAILURE, error } }
    },


};
