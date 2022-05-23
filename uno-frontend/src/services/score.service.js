/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const scoreService = {

    scoreTableKardex: async (user, career) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, career })
        };
    
        const response = await fetch(`${apiUrl}/score/table-score-kardex`, requestOptions);
        return handleResponse(response);
            

    },
    
    //Boleta de calificaciones
    scoreReportTable: async (user, career, quarter) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, career, quarter })
        };
    
        const response = await fetch(`${apiUrl}/score/table-score-report`, requestOptions);
        return handleResponse(response);
            
    },

    //Obtener estudiantes de acuerdo a materias del profesor
    scoreTableStudent: async (user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/score/table-score-student`, requestOptions);
        return handleResponse(response);
            
    },

    //Tabla de notas para asignar
    scoreTableAssign: async (data) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    
        const response = await fetch(`${apiUrl}/score/table-score-assign`, requestOptions);
        return handleResponse(response);

    },

    scoreUpdate: async (id, score) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(score)
        };
    
        const response = await fetch(`${apiUrl}/score/update-score/${id}`, requestOptions);
        return await handleResponse(response);

    },

    scoreCreate: async (score) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(score)
        };
    
        const response = await fetch(`${apiUrl}/score/create-score`, requestOptions);
        return handleResponse(response);
    },

    scoreGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/score/get-scores/${id}`, requestOptions);
        return await handleResponse(response);
    },

    //Obtener notas por estudiante
    scoreStudent: async ( user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/score/student-score`, requestOptions);
        return handleResponse(response);
            
    },

    //Obtener historial de notas
    scoreLog: async ( pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/score/log-score`, requestOptions);
        return handleResponse(response);
            
    },

    //Obtener notas (admin)
    scoreAdmin: async ( pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/score/admin-score`, requestOptions);
        return handleResponse(response);
            
    },

    getStudentCareer: async (idStudent) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({idStudent})
        };
    
        const response = await fetch(`${apiUrl}/score/get-careers-student`, requestOptions);
        return handleResponse(response);
    },


}
