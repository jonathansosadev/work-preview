
import { AuthSession } from "../utils/auth_session";
const config = require('../../config'); // Importacion del config

// Acceso a los elementos del config
console.log('DEV_LOG: ', config.apiKey);
console.log('DEV_LOG: ', config.baseUrl);

class Headers {
    private authSession: AuthSession = AuthSession.getInstance();

    headers(): HeadersInit {
        if (this.authSession.authSession?.data?.access === undefined) {
            return {
                "X-API-KEY": config.apiKey,
                "content-type": "application/json",
            };
        } else {
            return {
                "X-API-KEY": config.apiKey,
                "content-type": "application/json",
                "Authorization": `Bearer ${this.authSession.authSession?.data?.access}`
            };
        }
    }

    formDataHeaders(): HeadersInit {
        if (this.authSession.authSession?.data?.access === undefined) {
            return {
                "X-API-KEY": config.apiKey,
            };
        } else {
            return {
                "X-API-KEY": config.apiKey,
                "Authorization": `Bearer ${this.authSession.authSession?.data?.access}`
            };
        }
    }
}

export class BaseRepository {

    private headers: Headers = new Headers();
    async get(path: string): Promise<Response | undefined> {

        return await fetch(config.baseUrl + path, {
            method: "GET",
            headers: this.headers.headers(),
            redirect: 'follow',
        });
    }
    async post(path: string, data?: object): Promise<Response | undefined> {
        return await fetch(config.baseUrl + path, {
            method: 'POST',
            headers: this.headers.headers(),
            redirect: 'follow',
            body: JSON.stringify(data)
        });
    }

    async postFormData(path: string, data?: BodyInit) {
        return await fetch(config.baseUrl + path, {
            method: 'POST',
            headers: this.headers.formDataHeaders(),
            redirect: 'follow',
            body: data
        });
    }

    async put(path: string, data: object, useFormDataHeader: boolean = false): Promise<Response | undefined> {
        if (!useFormDataHeader) {
            return await fetch(config.baseUrl + path, {
                method: 'PUT',
                headers: this.headers.headers(),
                redirect: 'follow',
                body: JSON.stringify(data)
            });
        }
        else {
            return await fetch(config.baseUrl + path, {
                method: 'PUT',
                headers: this.headers.headers(),
                redirect: 'follow',
                body: JSON.stringify(data)
            });
        }
    }

    async patch(path: string, data: object, useFormDataHeader: boolean = false): Promise<Response | undefined> {

        if (!useFormDataHeader) {
            return await fetch(config.baseUrl + path, {
                method: 'PATCH',
                headers: this.headers.headers(),
                redirect: 'follow',
                body: JSON.stringify(data)
            });
        }
        else {
            return await fetch(config.baseUrl + path, {
                method: 'PATCH',
                headers: this.headers.formDataHeaders(),
                redirect: 'follow',
                body: JSON.stringify(data)
            });

        }

    }

    async delete(path: string): Promise<Response | undefined> {
        return await fetch(config.baseUrl + path, {
            method: 'DELETE',
            headers: this.headers.headers(),
            redirect: 'follow',
        });
    }
}
