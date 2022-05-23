import { GeneralException } from './custom_exceptions';

export class UserDetailsException extends GeneralException {

    exceptionTitle = "Error";
    exceptionDescription = "No se pudo obtener la información de usuario";
}