/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const inscriptionService = {

    inscriptionTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/inscription/table-inscription`, requestOptions);
        return handleResponse(response);
            
    },

    inscriptionCreate: async (inscription) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(inscription)
        };
    
        const response = await fetch(`${apiUrl}/inscription/create-inscription`, requestOptions);
        return handleResponse(response);
    },

    inscriptionCreateRegular: async (inscription) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(inscription)
        };
    
        const response = await fetch(`${apiUrl}/inscription/create-inscription-regular`, requestOptions);
        return handleResponse(response);
    },


    inscriptionUpdate: async (id, inscription) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(inscription)
        };
    
        const response = await fetch(`${apiUrl}/inscription/update-inscription/${id}`, requestOptions);
        await handleResponse(response);
        return inscription;
    },

    inscriptionGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/inscription/get-inscription/${id}`, requestOptions);
        return await handleResponse(response);
    },

    inscriptionData: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/inscription/get-data-inscription/`, requestOptions);
        return await handleResponse(response);
    },

    removeInscription: async (id, user) => {
        const requestOptions = {
            method: 'DELETE',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        };
        
        const response = await fetch(`${apiUrl}/inscription/remove-inscription/${id}`, requestOptions);
        return handleResponse(response);
    },

}
