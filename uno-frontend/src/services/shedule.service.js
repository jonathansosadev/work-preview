/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';


export const sheduleService = {

    /**
     * Consulta para DataTable de horarios
     * @param {Number} pageIndex: número de página
     * @param {Number} pageSize: cantidad de filas por página
     * @param {Object} sortBy: orden de columnas
     * @param {String} filters: filtros
     */
     sheduleTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/shedule/table-shedule`, requestOptions);
        return handleResponse(response);
            
    },

    sheduleCreate: async (shedule) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(shedule)
        };
    
        const response = await fetch(`${apiUrl}/shedule/create-shedule`, requestOptions);
        return handleResponse(response);
    },

    sheduleUpdate: async (id, shedule) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(shedule)
        };
    
        const response = await fetch(`${apiUrl}/shedule/update-shedule/${id}`, requestOptions);
        await handleResponse(response);
        return shedule;
    },

    sheduleDelete: async (id) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/shedule/delete-shedule/${id}`, requestOptions);
        await handleResponse(response);
    },

    sheduleGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/shedule/get-shedule/${id}`, requestOptions);
        return await handleResponse(response);
    },

    sheduleGetUser: async (user) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
    
        const response = await fetch(`${apiUrl}/shedule/get-shedule-user`, requestOptions);
        return await handleResponse(response);
    },

    sheduleList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/shedule/get-shedules`, requestOptions);
        return await handleResponse(response);
    }

}

