import { GetCityException } from "../exceptions/get_provices_exceptions copy";
import { Cities } from "../interfaces/cities_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";

interface GetCitiesParams {
    province_id?: number | undefined;
}

export default class GetCitiesUseCase implements UseCase<Cities, GetCitiesParams>{
    async call(params?: GetCitiesParams | undefined): Promise<Cities> {
        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.get(`api/v1/cities/?province_id=${params?.province_id ?? ""}`);
        switch (response.status) {
            case 200:
                let cities: Cities = await response.json();
                return cities;
            default:
                throw new GetCityException();
        }
    }

}