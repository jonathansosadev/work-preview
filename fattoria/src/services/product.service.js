/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';
export const productService = {
    
    productTable: async () => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/product/table-product`, requestOptions);
        return handleResponse(response);    
    },

    productTableHistory: async (user, pageIndex, pageSize, sortBy, filters) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pageIndex, pageSize, sortBy, filters })
        };
        const response = await fetch(`${apiUrl}/product/table-product-history`, requestOptions);
        return handleResponse(response); 
    },

    productCreate: async (product) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        };
        const response = await fetch(`${apiUrl}/product/create-product`, requestOptions);
        return handleResponse(response);
    },

    productUpdate: async (id, product) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        };
        const response = await fetch(`${apiUrl}/product/update-product/${id}`, requestOptions);
        await handleResponse(response);
        return product;
    },

    productGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
    
        const response = await fetch(`${apiUrl}/product/get-product/${id}`, requestOptions);
        return await handleResponse(response);
    },

    productList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/product/get-products`, requestOptions);
        return await handleResponse(response);
    },

    productOfferList: async (idAgency) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/product/product-offer/${idAgency}`, requestOptions);
        return await handleResponse(response);
    }

}

