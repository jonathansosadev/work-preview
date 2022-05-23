import { GeneralException } from "./custom_exceptions";

export class UpdateUserInfoException extends GeneralException{

    exceptionTitle = "Error al actualizar información";
    exceptionDescription = "No se pudo actualizar la información de usuario. Intente de nuevo más tarde"

}


export class CityDoesNotExist extends UpdateUserInfoException {
    exceptionDescription = "No tenemos servicio en esta ciudad por el momento"
}