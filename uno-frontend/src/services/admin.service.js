/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const adminService = {

    adminTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/admin/table-admin`, requestOptions);
        return handleResponse(response);
            
    },

    adminCreate: async (admin) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        };
    
        const response = await fetch(`${apiUrl}/admin/create-admin`, requestOptions);
        return handleResponse(response);
    },

    adminUpdate: async (id, admin) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(admin)
        };
    
        const response = await fetch(`${apiUrl}/admin/update-admin/${id}`, requestOptions);
        await handleResponse(response);
        return admin;
    },

    adminGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/admin/get-admin/${id}`, requestOptions);
        return await handleResponse(response);
    },


}
