import { GeneralException } from "./custom_exceptions";

export default class CarsListException extends GeneralException {

    exceptionTitle = "Error al consultar los autos";
    exceptionDescription = "No se pudo consultar los autos. Intente de nuevo más tarde";
}