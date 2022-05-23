import { GeneralException } from "./custom_exceptions";

export default class CreateCarsException extends GeneralException {
    exceptionTitle = "Error al crear el auto";
    exceptionDescription = "No se pudo crear el auto. Intenta de nuevo más tarde."
}