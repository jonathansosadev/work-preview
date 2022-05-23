import { GeneralException } from "./custom_exceptions";

export class UploadAddressException extends GeneralException {

    exceptionTitle = "Error al subir direcciones";
    exceptionDescription = "No se pudo actualizar la dirección.";

}

export class CanNotHaveTwoDefaultAddressException extends UploadAddressException{
    exceptionDescription = "No puede tener dos direcciones por defecto.";
}