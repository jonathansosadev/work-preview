import { GeneralException } from "./custom_exceptions";

export class PostCarsException extends GeneralException {
    exceptionTitle = "Error al postear el auto";
    exceptionDescription = "No se pudo postear el auto. Intente de nuevo más tarde";
}

export class NoApprovedCar extends GeneralException {
    exceptionDescription = "El auto no puede ser posteado ya que no ha sido aprobado";
}