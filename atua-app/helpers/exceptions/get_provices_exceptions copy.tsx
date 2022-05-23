import { GeneralException } from "./custom_exceptions";

export class GetCityException extends GeneralException {
    exceptionTitle = "Error al buscar las ciudades";
    exceptionDescription = "No se pudo encontrar las ciudades."
}