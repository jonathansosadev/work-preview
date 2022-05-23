import { GeneralException } from './custom_exceptions';


export class DocumentTypeException extends GeneralException {
    exceptionTitle = "Error de obtención de documentos";
    exceptionDescription = "No se pudo obtener los documentos";
}