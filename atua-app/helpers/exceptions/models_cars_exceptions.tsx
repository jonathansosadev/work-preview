import { GeneralException } from "./custom_exceptions";

export class ModelsCarsException extends GeneralException {
    exceptionTitle = "Error al buscar las modelos";
    exceptionDescription = "No se pudo hallar las modelos de carros";
}