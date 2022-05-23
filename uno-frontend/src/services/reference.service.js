/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const referenceService = {

    //Obtener referencias admin
    referenceTable: async (user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/reference/table-reference-admin`, requestOptions);
        return handleResponse(response);
            
    },
    

    //Obtener referencias estudiante
    referenceTableStudent: async (user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/reference/table-reference`, requestOptions);
        return handleResponse(response);
            
    },

    referenceUpdate: async (id, data) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    
        const response = await fetch(`${apiUrl}/reference/update-reference/${id}`, requestOptions);
        return await handleResponse(response);

    },


    referenceGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/reference/get-reference/${id}`, requestOptions);
        return await handleResponse(response);
    },


}
