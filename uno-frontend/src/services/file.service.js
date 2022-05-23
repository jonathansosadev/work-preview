/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';
var download = require("downloadjs")

export const fileService = {

    fileTable: async (user, pageIndex, pageSize, sortBy, filters) => {
        
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/file/table-files`, requestOptions);
        return handleResponse(response);
            
    },

    fileTableUsers: async ( pageIndex, pageSize, sortBy, filters) => {
        
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/file/table-files-user`, requestOptions);
        return handleResponse(response);
            
    },

    fileCreate: async (data) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader() },
            body: data
        };
    
        const response = await fetch(`${apiUrl}/file/upload-file`, requestOptions);
        return handleResponse(response);
    },

    fileDownload: async (id, filename) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader() },
        };

        const response = await fetch(`${apiUrl}/file/download-file/${id}`, requestOptions)
        const blob = await response.blob();
        download(blob, filename);
    },

    fileDelete: async (id) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader() },
        };
    
        const response = await fetch(`${apiUrl}/file/delete-file/${id}`, requestOptions);
        return handleResponse(response);
    },

    fileUpdate: async (id, file) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(file)
        };
    
        const response = await fetch(`${apiUrl}/file/update-file/${id}`, requestOptions);
        await handleResponse(response);
        return file;
    },

    fileGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/file/get-file/${id}`, requestOptions);
        return await handleResponse(response);
    },

    fileList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/file/get-agencies`, requestOptions);
        return await handleResponse(response);
    }

}

