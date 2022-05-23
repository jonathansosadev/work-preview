/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const teacherService = {

    teacherTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/teacher/table-teachers`, requestOptions);
        return handleResponse(response);
            
    },

    teacherCreate: async (teacher) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(teacher)
        };
    
        const response = await fetch(`${apiUrl}/teacher/create-teacher`, requestOptions);
        return handleResponse(response);
    },

    teacherUpdate: async (id, teacher) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(teacher)
        };
    
        const response = await fetch(`${apiUrl}/teacher/update-teacher/${id}`, requestOptions);
        await handleResponse(response);
        return teacher;
    },

    teacherGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/teacher/get-teacher/${id}`, requestOptions);
        return await handleResponse(response);
    },


}
