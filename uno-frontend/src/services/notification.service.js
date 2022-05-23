/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const notificationService = {

    //Obtener notificaciones admin
    notificationTable: async (user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/notification/table-notification`, requestOptions);
        return handleResponse(response);
            
    },
    

    //Obtener notificaciones docente
    notificationTableTeacher: async (user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/notification/table-notification-user`, requestOptions);
        return handleResponse(response);
            
    },

    //Obtener reporte de notificaciones
    notificationsReport: async (user, pageIndex, pageSize, sortBy, filters) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/notification/table-notification-report`, requestOptions);
        return handleResponse(response);
            
    },

    notificationCreate: async (notification) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        };
    
        const response = await fetch(`${apiUrl}/notification/create-notification`, requestOptions);
        return handleResponse(response);
    },

    notificationUpdate: async (id, notification) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(notification)
        };
    
        const response = await fetch(`${apiUrl}/notification/update-notification/${id}`, requestOptions);
        await handleResponse(response);
        return notification;
    },


    notificationGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/notification/get-notification/${id}`, requestOptions);
        return await handleResponse(response);
    },

    notificationGetAdmin: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/notification/get-notification-admin/${id}`, requestOptions);
        return await handleResponse(response);
    },


    //quitar notificacion con bandera
    removeNotification: async (id) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader() },
        };
    
        const response = await fetch(`${apiUrl}/notification/remove-user-notification/${id}`, requestOptions);
        return handleResponse(response);
    },

    //eliminar notificacion de bd
    deleteNotification: async (id) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader() },
        };
    
        const response = await fetch(`${apiUrl}/notification/delete-notification/${id}`, requestOptions);
        return handleResponse(response);
    },


}
