import BrandCarsException from "../exceptions/brand_cars_exception";
import { Brand, BrandCarsInterface } from "../interfaces/brand_cars_interfaces";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";


interface BrandCarsUseCaseParams {
    name?: string | undefined;
}
/**
            * Como usarlo:
            * 
            * let brandCarsUseCase : BrandCarsUseCase = new BrandCarsUseCase();
            * 
            * let brands : Brand[] = await brandCarsUseCase.call();
*/
export default class BrandCarsUseCase implements UseCase<Brand[], BrandCarsUseCaseParams> {


    private baseRepository: BaseRepository = new BaseRepository();

    async call(params?: BrandCarsUseCaseParams | undefined): Promise<Brand[]> {

        let listBrandsCars: Brand[] = [];
        try {
            let response = await this.baseRepository.get("api/v1/cars/brands_cars/?name=" + (params?.name ?? ""));
            switch (response!.status) {
                case 200:
                    let brandCars: BrandCarsInterface = await response?.json();
                    listBrandsCars = brandCars.data;
                    return listBrandsCars;
                default:
                    throw new BrandCarsException();
            }
        } catch (error) {
            throw new BrandCarsException();
        };
    }





}