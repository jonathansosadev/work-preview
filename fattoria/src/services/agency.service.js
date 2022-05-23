/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const agencyService = {

    agencyTable: async () => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/agency/table-agency`, requestOptions);
        return handleResponse(response);   
    },

    agencyCreate: async (agency) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(agency)
        };
        const response = await fetch(`${apiUrl}/agency/create-agency`, requestOptions);
        return handleResponse(response);
    },

    agencyUpdate: async (id, agency) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(agency)
        };
        const response = await fetch(`${apiUrl}/agency/update-agency/${id}`, requestOptions);
        await handleResponse(response);
        return agency;
    },

    agencyGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/agency/get-agency/${id}`, requestOptions);
        return await handleResponse(response);
    },

    agencyList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/agency/get-agencies`, requestOptions);
        return await handleResponse(response);
    }


}

