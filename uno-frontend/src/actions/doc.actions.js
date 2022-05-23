/* eslint-disable */
import { documentConstants } from '../constants';
import { documentService } from '../services';
import { alertActions } from '.';

export const documentActions = {


    /**
     * Consulta para DataTable de documentos del alumno
     */
    documentStudent( user ) {
        return dispatch => {
            dispatch(request());

            documentService.documentList( user )
                .then(
                    documents => {
                        dispatch(success(documents))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: documentConstants.DOC_TABLE_REQUEST } }
        function success(documents) { return { type: documentConstants.DOC_TABLE_SUCCESS, documents } }
        function failure(error) { return { type: documentConstants.DOC_TABLE_FAILURE, error } }
    },

    /**
     * Consulta para DataTable de documentos de todos
     */
    dataTableDocuments( pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            documentService.documentTableUsers( pageIndex, pageSize, sortBy, filters)
                .then(
                    documents => {
                        dispatch(success(documents))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: documentConstants.DOC_TABLE_REQUEST } }
        function success(documents) { return { type: documentConstants.DOC_TABLE_SUCCESS, documents } }
        function failure(error) { return { type: documentConstants.DOC_TABLE_FAILURE, error } }
    },

    //Registrar archivo
    createDocument(data) {
        return dispatch => {
            dispatch(request());

            documentService.documentCreate(data)
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

        function request() { return { type: documentConstants.DOC_CREATE_REQUEST } }
        function success(document) { return { type: documentConstants.DOC_CREATE_SUCCESS, document } }
        function failure(error) { return { type: documentConstants.DOC_CREATE_FAILURE, error } }
    },

    //Obtener documento para mostrar
    getFile(id) {
        return dispatch => {
            dispatch(request(id));

            documentService.documentGet(id)
                .then(
                    document => {
                        dispatch(success(document));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: documentConstants.DOC_GET_REQUEST, id } }
        function success(document) { return { type: documentConstants.DOC_GET_SUCCESS, document } }
        function failure(error) { return { type: documentConstants.DOC_GET_FAILURE, error } }
    },

    //Eliminar documento
    deleteDocument(id) {
        return dispatch => {
            dispatch(request());

            documentService.documentDelete(id)
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

        function request() { return { type: documentConstants.DOC_DELETE_REQUEST } }
        function success() { return { type: documentConstants.DOC_DELETE_SUCCESS } }
        function failure(error) { return { type: documentConstants.DOC_DELETE_FAILURE, error } }
    },

};
