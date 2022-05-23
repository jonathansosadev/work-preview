import { GeneralException } from "./custom_exceptions";

export default class BrandCarsException extends GeneralException {
    exceptionTitle = "Error al buscar las marcas";
    exceptionDescription = "No se pudo hallar las marcas de carros";
}