/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const groupService = {

    /**
     * Consulta para DataTable de grupos
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
    groupTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/group/table-group`, requestOptions);
        return handleResponse(response);
            
    },

    groupCreate: async (group) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(group)
        };
    
        const response = await fetch(`${apiUrl}/group/create-group`, requestOptions);
        return handleResponse(response);
    },

    groupDelete: async (id) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/group/delete-group/${id}`, requestOptions);
        await handleResponse(response);
    },

    groupList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/group/get-group`, requestOptions);
        return await handleResponse(response);
    }

}

