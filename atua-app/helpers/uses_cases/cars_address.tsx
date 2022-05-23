import CarsAddressException from "../exceptions/cars_address_exception";
import { CarsAddress } from "../interfaces/cars_address_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoParams } from "./base";

export default class CarsAddressUseCase implements UseCaseNoParams<CarsAddress> {

    private baseRepository: BaseRepository = new BaseRepository();

    async call(): Promise<CarsAddress> {
        let response = await this.baseRepository.get("api/v1/cars/address/")
        switch (response?.status) {
            case 200:
                let carsList:CarsAddress = await response.json();
                return carsList        
            default:
                throw new CarsAddressException();
        }
    }

    async requestNextPage(url?: string | undefined): Promise<CarsAddress> {
        if(url === undefined){
            throw new Error("No tienes más direcciones");
        }
        let response = await this.baseRepository.get(url)
        switch (response?.status) {
            case 200:
                let carsList:CarsAddress = await response.json();
                return carsList        
            default:
                throw new CarsAddressException();
        }
    }

    async requestPreviousPage(url?: string | undefined): Promise<CarsAddress> {
        if(url === undefined){
            throw new Error("No tienes más direcciones");
        }
        let response = await this.baseRepository.get(url)
        switch (response?.status) {
            case 200:
                let carsList:CarsAddress = await response.json();
                return carsList        
            default:
                throw new CarsAddressException();
        }
    }

}