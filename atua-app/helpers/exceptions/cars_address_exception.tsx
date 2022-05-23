import { GeneralException } from "./custom_exceptions";

export default class CarsAddressException extends GeneralException {

    exceptionTitle = "Error al consultar la dirección de los autos";
    exceptionDescription = "No se pudo consultar la dirección de los autos. Intente de nuevo más tarde";
}