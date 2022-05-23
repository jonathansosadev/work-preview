/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';
export const matterService = {

    matterTable: async (pageIndex, pageSize, sortBy, globalFilter) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/matter/table-matter`, requestOptions);
        return handleResponse(response);
            
    },

    matterCreate: async (matter) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(matter)
        };
    
        const response = await fetch(`${apiUrl}/matter/create-matter`, requestOptions);
        return handleResponse(response);
    },

    matterUpdate: async (id, matter) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(matter)
        };
    
        const response = await fetch(`${apiUrl}/matter/update-matter/${id}`, requestOptions);
        await handleResponse(response);
        return matter;
    },

    matterGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/matter/get-matter/${id}`, requestOptions);
        return await handleResponse(response);
    },

    matterAll: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/matter/get-matter/`, requestOptions);
        return await handleResponse(response);
    }

}
