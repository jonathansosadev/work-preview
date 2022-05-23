/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const documentService = {

    documentCreate: async (data) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader() },
            body: data
        };
    
        const response = await fetch(`${apiUrl}/document/upload-document`, requestOptions);
        return handleResponse(response);
    },

    documentTableUsers: async ( pageIndex, pageSize, sortBy, filters) => {
        
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/document/table-documents-user`, requestOptions);
        return handleResponse(response);
            
    },

    documentDelete: async (id) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader() },
        };
    
        const response = await fetch(`${apiUrl}/document/delete-student-document/${id}`, requestOptions);
        return handleResponse(response);
    },


    documentList: async (user) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({user})
        };
    
        const response = await fetch(`${apiUrl}/document/table-student-docs`, requestOptions);
        return await handleResponse(response);
    }

}

