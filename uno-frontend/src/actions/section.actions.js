/* eslint-disable */
import { sectionConstants } from '../constants/section.constants';
import { sectionService } from '../services/section.service';
import { alertActions } from './';

export const sectionActions = {


    /**
     * Consulta para DataTable de secciones
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} globalFilter: filtro global
     */
    dataTable() {
        return dispatch => {
            dispatch(request());

            sectionService.sectionTable()
                .then(
                    sections => {
                        dispatch(success(sections))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: sectionConstants.SECTION_TABLE_REQUEST } }
        function success(sections) { return { type: sectionConstants.SECTION_TABLE_SUCCESS, sections } }
        function failure(error) { return { type: sectionConstants.SECTION_TABLE_FAILURE, error } }
    },

    //Registrar secciones
    createClase(section) {
        return dispatch => {
            dispatch(request(section));

            sectionService.createSetion(section)
                .then(
                    () => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado las sección correctamente!'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(section) { return { type: sectionConstants.SECTION_CREATE_REQUEST, section } }
        function success(section) { return { type: sectionConstants.SECTION_CREATE_SUCCESS, section } }
        function failure(error) { return { type: sectionConstants.SECTION_CREATE_FAILURE, error } }
    },


  //Actualizar información seccion
    updateSection(id, section) {
        return dispatch => {
            dispatch(request(section));

            sectionService.SectionUpdate(id,section)
                .then(
                    section => {
                        dispatch(success(section));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

    function request(id) { return { type: sectionConstants.SECTION_UPDATE_REQUEST, id } }
    function success(section) { return { type: sectionConstants.SECTION_UPDATE_SUCCESS, section } }
    function failure(error) { return { type: sectionConstants.SECTION_UPDATE_FAILURE, error } }
},

//Actualizar información Secciones
    listSections() {
        return dispatch => {
            dispatch(request());

            sectionService.SectionGetAll()
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

    function request() { return { type: sectionConstants.SECTION_LIST_REQUEST } }
    function success(list) { return { type: sectionConstants.SECTION_LIST_SUCCESS, list } }
    function failure(error) { return { type: sectionConstants.SECTION_LIST_FAILURE, error } }
}


};
