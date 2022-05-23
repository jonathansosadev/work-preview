import { GeneralException } from './custom_exceptions';


export class DocumentRegisterException extends GeneralException {

    exceptionTitle = "Error al subir documentos"
    exceptionDescription = "No se pudo subir el documentos"

}