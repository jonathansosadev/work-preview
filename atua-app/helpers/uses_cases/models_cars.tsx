import { ModelsCarsException } from "../exceptions/models_cars_exceptions";
import { Cars, ModelsCars } from "../interfaces/models_cars";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";

interface ModelCarsUseCaseParams {
    brand_id?: number | undefined;
}

export default class ModelsCarsUseCase implements UseCase<Cars[], ModelCarsUseCaseParams>{

    private baseRepository: BaseRepository = new BaseRepository();

    async call(params?: ModelCarsUseCaseParams | undefined): Promise<Cars[]> {

        let listCars: Cars[] = [];
        let response = await this.baseRepository.get("api/v1/cars/models_cars/?brand_id=" + (params?.brand_id ?? ""));
        switch (response!.status) {
            case 200:
                let modelsCars: ModelsCars = await response?.json();
                listCars = modelsCars.data;
                return listCars;
            default:
                throw new ModelsCarsException();
        }
    }

}