import { GeneralException } from "./custom_exceptions";

export class GetProvinceException extends GeneralException {
    exceptionTitle = "Error al buscar las provincias";
    exceptionDescription = "No se pudo encontrar las provincias."
}