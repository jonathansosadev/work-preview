import { GeneralException } from "./custom_exceptions";

export class ChangePasswordException extends GeneralException {

    exceptionTitle = "Error al cambiar contraseña";
    exceptionDescription = "No se pudo cambiar la contraseña";

}

export class NoMatchOldPassword extends ChangePasswordException {
    exceptionDescription = "No coincide la contraseña antigüa"
}