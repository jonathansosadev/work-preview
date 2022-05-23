import { GeneralException } from './custom_exceptions';


export class BaseRegisterException extends GeneralException {
    exceptionTitle = "Error de registro";
    exceptionDescription = "No se pudo registrar al usuario. Intente de nuevo más tarde";
}

export class InvalidPhone extends BaseRegisterException {
    exceptionDescription = "Ingrese un número de teléfono válido.";
}

export class DuplicateUser extends BaseRegisterException {
    exceptionDescription = "Ya existe un usuario con esa combinación de credenciales";
}