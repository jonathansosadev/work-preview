/* eslint-disable */
import { passphrase, apiUrl, passphraseData } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';
import CryptoJS from "crypto-js"

export const userService = {

    login: (username, password) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        };
    
        return fetch(`${apiUrl}/users/authenticate`, requestOptions)
            .then(handleResponse)
            .then(user => {

                // almacenar detalles de usuario y token jwt en almacenamiento local para mantener al usuario conectado entre actualizaciones de página
                var cryptUser = CryptoJS.AES.encrypt(JSON.stringify(user.user), passphrase).toString();
                localStorage.setItem('user', cryptUser);
    
                // almacenar data de monedas, productos y terminales en almacenamiento local para permitir ventas offline
                var cryptData = CryptoJS.AES.encrypt(JSON.stringify(user.data), passphraseData).toString();
                localStorage.setItem('sale', cryptData);
                return user;
    
            });
    },
    
    logout() {
        // eliminar usuario del almacenamiento local para cerrar sesión
        localStorage.removeItem('user');
        localStorage.removeItem('timer');
        localStorage.removeItem('sale');
    },
    
    getAll: () => {
        const requestOptions = {
            method: 'GET',
            headers: authHeader()
        };
    
        return fetch(`${apiUrl}/users`, requestOptions).then(handleResponse);
    },
    
    getById: (id) => {
        const requestOptions = {
            method: 'GET',
            headers: authHeader()
        };
    
        return fetch(`${apiUrl}/users/${id}`, requestOptions).then(handleResponse);
    },

    //obtener cliente
    getClientById: (id) => {
        const requestOptions = {
            method: 'GET',
            headers: authHeader()
        };
    
        return fetch(`${apiUrl}/client/${id}`, requestOptions).then(handleResponse);
    },
    
    register: (user) => {
        const requestOptions = {
            method: 'POST',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
    
        return fetch(`${apiUrl}/users/register`, requestOptions).then(handleResponse);
    },
    
    update: (id, user) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
    
        return fetch(`${apiUrl}/users/update-user/${id}`, requestOptions).then(handleResponse).then(() => {
            // actualizar data del localStorage
            let userData = localStorage.getItem('user');
    
            if(userData){
                var bytes = CryptoJS.AES.decrypt(userData, passphrase);
                var originalData = bytes.toString(CryptoJS.enc.Utf8);
                userData = JSON.parse(originalData);
                Object.assign(userData, user);
                var cryptUser = CryptoJS.AES.encrypt(JSON.stringify(userData), passphrase).toString();
                localStorage.setItem('user', cryptUser);
            }else{
                return Promise.reject('Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.');
            }
            
            return userData;
        })
    },

    updateUserData: (id, user) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
    
        return fetch(`${apiUrl}/users/update-user/${id}`, requestOptions).then(handleResponse);
    },

    //Actualizar cliente
    updateClientData: (id, user) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
    
        return fetch(`${apiUrl}/client/update-client/${id}`, requestOptions).then(handleResponse);
    },

    usersTable: async (user) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user })
        };
        const response = await fetch(`${apiUrl}/users/table-users`, requestOptions);
        return handleResponse(response);
    },

    usersList: async (user) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        };
        const response = await fetch(`${apiUrl}/users/list-users`, requestOptions);
        return handleResponse(response);
    },
    
    _delete: (id) => {
        const requestOptions = {
            method: 'DELETE',
            headers: authHeader()
        };
        return fetch(`${apiUrl}/users/${id}`, requestOptions).then(handleResponse);
    },
    
    //tabla de clientes
    clientsList: async ( user, pageIndex, pageSize, sortBy, filters, isExcel) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters, isExcel })
        };
        const response = await fetch(`${apiUrl}/client/table-clients`, requestOptions);
        return handleResponse(response);
            
    },

    //lista de clientes
    clientTypeahead: async (user) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({document:user})
        };
        const response = await fetch(`${apiUrl}/client/search-document`, requestOptions);
        return handleResponse(response);
    },
};

