/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const studentService = {

    studentTable: async (pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/student/table-student`, requestOptions);
        return handleResponse(response);
            
    },

    studentUpdate: async (id, student) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        };
    
        const response = await fetch(`${apiUrl}/student/update-student/${id}`, requestOptions);
        await handleResponse(response);
        return student;
    },

    studentGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/student/get-student/${id}`, requestOptions);
        return await handleResponse(response);
    },


}
