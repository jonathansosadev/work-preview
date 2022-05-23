import { GetCountriesException } from "../exceptions/get_countries_exceptions";
import { Countries } from "../interfaces/countries_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCaseNoParams } from "./base";

export default class GetCountriesUseCase implements UseCaseNoParams<Countries> {
   async call(): Promise<Countries> {
        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.get("api/v1/country/");
        switch (response.status) {
            case 200:
                let countries: Countries = await response.json();
                return countries;        
            default:
                throw new GetCountriesException();
        }
    }
}