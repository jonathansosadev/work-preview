import { GeneralException } from "./custom_exceptions";

export default class MyCarsListException extends GeneralException {
    exceptionTitle = "Error al consultar mis autos."
    exceptionDescription = "No se pudo consultar mis atuos. Intentalo de nuevo más tarde"
}