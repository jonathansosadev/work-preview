import { GeneralException } from "./custom_exceptions";

export class GetCountriesException extends GeneralException {
    exceptionTitle = "Error al buscar los paises";
    exceptionDescription = "No se pudo encontrar los paises."
}