/* eslint-disable */
import { passphrase, apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';
import CryptoJS from "crypto-js";

export const userService = {
    login,
    logout,
    register,
    confirmEmail,
    forgot,
    reset,
    restorePassword,
    getAll,
    getById,
    update,
    uploadImage,
    delete: _delete,
    updatePwd
};

function login(email, password) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    };

    return fetch(`${apiUrl}/users/authenticate`, requestOptions)
        .then(handleResponse)
        .then(user => {
            // almacenar detalles de usuario y token jwt en almacenamiento local para mantener al usuario conectado entre actualizaciones de página
            var cryptUser = CryptoJS.AES.encrypt(JSON.stringify(user), passphrase).toString();
            localStorage.setItem('user', cryptUser);

            return user;
        })
}

function logout() {
    // eliminar usuario del almacenamiento local para cerrar sesión
    localStorage.removeItem('user');
}

async function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${apiUrl}/users`, requestOptions).then(handleResponse);
}

function getById(id) {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}

function register(user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${apiUrl}/users/register`, requestOptions).then(handleResponse);
}

function confirmEmail(token) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({token:token})
    };

    return fetch(`${apiUrl}/users/confirmEmail`, requestOptions).then(handleResponse);
}

//Enviar email para restaurar contraseña
function forgot(email) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
    };

    return fetch(`${apiUrl}/users/forgot`, requestOptions).then(handleResponse);
}

//Comprobar token para restrablecer contraseña
function reset(token) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    };

    return fetch(`${apiUrl}/users/reset/${token}`, requestOptions).then(handleResponse);
}

function restorePassword(token, user) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${apiUrl}/users/reset/${token}`, requestOptions).then(handleResponse);
}

/**
 * 
 * @param {ObjectID} id 
 * @param {Object} user datos
 */
async function update(id, user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ... authHeader(), 'Content-Type': 'application/json' },
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
    }).catch((error) => {
        return Promise.reject('Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo más tarde.');
    });
}

/**
 * 
 * @param {ObjectID} id 
 * @param {Object} user datos
 */
 async function updatePwd(id, user) {
    const requestOptions = {
        method: 'PUT',
        headers: { ... authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    };

    return fetch(`${apiUrl}/users/update-user/${id}`, requestOptions).then(handleResponse);
}

/**
 * 
 * @param {ObjectID} id 
 * @param {Object} file imagen
 */
async function uploadImage(id, file) {
    const requestOptions = {
        method: 'POST',
        headers: { ... authHeader() },
        body: file
    };

    return fetch(`${apiUrl}/users/upload-image/${id}`, requestOptions).then(handleResponse).then((user) => {
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
}

function _delete(id) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader()
    };

    return fetch(`${apiUrl}/users/${id}`, requestOptions).then(handleResponse);
}