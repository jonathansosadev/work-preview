/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const coinService = {

    coinTable: async () => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/coin/table-coin`, requestOptions);
        return handleResponse(response);   
    },

    coinCreate: async (coin) => {
        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(coin)
        };
        const response = await fetch(`${apiUrl}/coin/create-coin`, requestOptions);
        return handleResponse(response);
    },

    coinUpdate: async (id, coin) => {
        const requestOptions = {
            method: 'PUT',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify(coin)
        };
        const response = await fetch(`${apiUrl}/coin/update-coin/${id}`, requestOptions);
        await handleResponse(response);
        return coin;
    },

    coinGet: async (id) => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/coin/get-coin/${id}`, requestOptions);
        return await handleResponse(response);
    },

    coinList: async () => {
        const requestOptions = {
            method: 'GET',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
        };
        const response = await fetch(`${apiUrl}/coin/get-coins`, requestOptions);
        return await handleResponse(response);
    }


}

