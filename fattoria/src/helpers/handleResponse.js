import { userService } from '../services';

function logout() {
    // eliminar usuario del almacenamiento local para cerrar sesión
    userService.logout();
}

export default function handleResponse(response) {

    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout si se retorna 401
                logout();
                window.location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}