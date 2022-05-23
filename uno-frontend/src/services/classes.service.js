/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';
export const classService = {


    /**
     * Consulta para DataTable de clases
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
     classTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/classes/table-classes`, requestOptions);
        return handleResponse(response);
            
    },

    classCreate: async (data) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    
        const response = await fetch(`${apiUrl}/classes/create-class`, requestOptions);
        return handleResponse(response);
    },

    classDelete: async (id) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/classes/delete-class/${id}`, requestOptions);
        await handleResponse(response);
    },

    classUpdate: async (id, data) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    
        const response = await fetch(`${apiUrl}/classes/update-class/${id}`, requestOptions);
        return await handleResponse(response);
    },

    classGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/classes/get-class/${id}`, requestOptions);
        return await handleResponse(response);
    },

    groupMatter: async (id) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/classes/group-matter/${id}`, requestOptions);
        return await handleResponse(response);
    }

}
