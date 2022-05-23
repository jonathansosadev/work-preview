/* eslint-disable */
import { fileConstants } from '../constants';
import { fileService } from '../services';
import { alertActions } from './';

export const fileActions = {

    /**
     * Consulta para DataTable de archivos del usuario
     */
    dataTable(user, pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            fileService.fileTable(user, pageIndex, pageSize, sortBy, filters)
                .then(
                    files => {
                        dispatch(success(files))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: fileConstants.FILE_TABLE_REQUEST } }
        function success(files) { return { type: fileConstants.FILE_TABLE_SUCCESS, files } }
        function failure(error) { return { type: fileConstants.FILE_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de archivos de todos
     */
    dataTableFiles( pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            fileService.fileTableUsers( pageIndex, pageSize, sortBy, filters)
                .then(
                    files => {
                        dispatch(success(files))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: fileConstants.FILE_TABLE_REQUEST } }
        function success(files) { return { type: fileConstants.FILE_TABLE_SUCCESS, files } }
        function failure(error) { return { type: fileConstants.FILE_TABLE_FAILURE, error } }
    },

    //Registrar archivo
    createFile(data) {
        return dispatch => {
            dispatch(request());

            fileService.fileCreate(data)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado el archivo correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: fileConstants.FILE_CREATE_REQUEST } }
        function success(file) { return { type: fileConstants.FILE_CREATE_SUCCESS, file } }
        function failure(error) { return { type: fileConstants.FILE_CREATE_FAILURE, error } }
    },

    //descargar archivo
    downloadFile(id, filename) {
        return dispatch => {
            dispatch(request());

            fileService.fileDownload(id, filename)
                .then(
                    () => { 
                        dispatch(success());
                        //dispatch(alertActions.success('¡Se ha registrado el archivo correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: fileConstants.FILE_DOWNLOAD_REQUEST } }
        function success() { return { type: fileConstants.FILE_DOWNLOAD_SUCCESS } }
        function failure(error) { return { type: fileConstants.FILE_DOWNLOAD_FAILURE, error } }
    },

    //Obtenr información archivo
    getFile(id) {
        return dispatch => {
            dispatch(request(id));

            fileService.fileGet(id)
                .then(
                    file => {
                        dispatch(success(file));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: fileConstants.FILE_GET_REQUEST, id } }
        function success(file) { return { type: fileConstants.FILE_GET_SUCCESS, file } }
        function failure(error) { return { type: fileConstants.FILE_GET_FAILURE, error } }
    },

    //Actualizar información archivo
    updateFile(id, file) {
        return dispatch => {
            dispatch(request(file));

            fileService.fileUpdate(id,file)
                .then(
                    file => {
                        dispatch(success(file));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: fileConstants.FILE_UPDATE_REQUEST, id } }
        function success(file) { return { type: fileConstants.FILE_UPDATE_SUCCESS, file } }
        function failure(error) { return { type: fileConstants.FILE_UPDATE_FAILURE, error } }
    },

    //Actualizar información archivo
    deleteFile(id) {
        return dispatch => {
            dispatch(request());

            fileService.fileDelete(id)
                .then(
                    () => {
                        dispatch(success());
                        dispatch(alertActions.success('Se elimino el archivo correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: fileConstants.FILE_DELETE_REQUEST } }
        function success() { return { type: fileConstants.FILE_DELETE_SUCCESS } }
        function failure(error) { return { type: fileConstants.FILE_DELETE_FAILURE, error } }
    },

};
