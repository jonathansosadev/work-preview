/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';


export const careerService = {

    careerTable: async (pageIndex, pageSize, sortBy, globalFilter) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' }
        };
    
        const response = await fetch(`${apiUrl}/career/table-career`, requestOptions);
        return handleResponse(response);
            
    },

    careerCreate: async (career) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(career)
        };
    
        const response = await fetch(`${apiUrl}/career/create-career`, requestOptions);
        return handleResponse(response);
    },

    careerUpdate: async (id, career) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(career)
        };
    
        const response = await fetch(`${apiUrl}/career/update-career/${id}`, requestOptions);
        await handleResponse(response);
        return career;
    },

    careerGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/career/get-career/${id}`, requestOptions);
        return await handleResponse(response);
    },

    careerList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/career/get-careers`, requestOptions);
        return await handleResponse(response);
    }

}
