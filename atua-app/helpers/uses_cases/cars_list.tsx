import CarsListException from "../exceptions/cars_list_exception";
import { CarsList } from "../interfaces/cars_list_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoParams } from "./base";

export default class CarsListUseCase implements UseCaseNoParams<CarsList> {


    private baseRepository: BaseRepository = new BaseRepository();
   
    async call(): Promise<CarsList> {

        let response = await this.baseRepository.get("api/v1/cars/")
        switch (response?.status) {
            case 200:
                let carsList:CarsList = await response.json();
                return carsList        
            default:
                throw new CarsListException();
        }
    }


    async requestNextPage(url?: string | undefined): Promise<CarsList> {
        if(url === undefined){
            throw new Error("No hay más autos");
        }
        let response = await this.baseRepository.get(url)
        switch (response?.status) {
            case 200:
                let carsList:CarsList = await response.json();
                return carsList        
            default:
                throw new CarsListException();
        }
    }

    async requestPreviousPage(url?: string | undefined): Promise<CarsList> {
        if(url === undefined){
            throw new Error("No hay más autos");
        }
        let response = await this.baseRepository.get(url)
        switch (response?.status) {
            case 200:
                let carsList:CarsList = await response.json();
                return carsList        
            default:
                throw new CarsListException();
        }
    }
}