import CreateCarsException from "../exceptions/create_cars_exception";
import { CreateCarsResponse } from "../interfaces/create_cars_response_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";


interface CreateCarsUseCaseParams {
    plate: string;
    transmission: number | undefined;
    kilometers: string | undefined;
    year: number | undefined;
    doors: number | undefined;
    car_model: number | undefined;
    fuel_type: number | undefined;
    address_id: number;
}



export default class CreateCarUseCase implements UseCase<CreateCarsResponse, CreateCarsUseCaseParams> {
    async call(params: CreateCarsUseCaseParams): Promise<CreateCarsResponse> {

        let baseRepository: BaseRepository = new BaseRepository();

        let response: any = await baseRepository.post("api/v1/cars/my_cars/", {
            plate: params.plate,
            transmission: params.transmission,
            kilometers: params.kilometers,
            year: params.year,
            doors: params.doors,
            car_model: params.car_model,
            fuel_type: params.fuel_type,
            address_id: params.address_id,
        });
        switch (response.status) {
            case 200:
                let createCarsResponse: CreateCarsResponse = (await response.json())["data"];
                console.log(createCarsResponse);
                return createCarsResponse;
            default:
                throw new CreateCarsException();
        }
    }
}