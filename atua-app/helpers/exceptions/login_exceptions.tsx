import { GeneralException } from './custom_exceptions';

abstract class BaseLoginException extends GeneralException {
    exceptionTitle = "Error de inicio de sesión";
}
export class LoginException extends BaseLoginException {
    exceptionDescription = "No se pudo iniciar sesión. Intente de nuevo más tarde.";
}

export class NoExistUser extends BaseLoginException {
    exceptionDescription = "Usuario o contraseña incorrectos";
}