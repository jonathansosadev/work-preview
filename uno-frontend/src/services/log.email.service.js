/* eslint-disable */
import { apiUrl } from '../config/config';
import authHeader from '../helpers/auth-header';
import handleResponse from '../helpers/handleResponse';

export const logEmailService = {

    logEmailTable: async ( pageIndex, pageSize, sortBy, filters ) => {

        const requestOptions = {
            method: 'POST',
            headers: { ... authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({  pageIndex, pageSize, sortBy, filters })
        };
    
        const response = await fetch(`${apiUrl}/log/table-log-email`, requestOptions);
        return handleResponse(response);
            
    },

}
