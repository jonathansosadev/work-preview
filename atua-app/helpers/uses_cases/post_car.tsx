import { NoApprovedCar, NoApprovedCar as PostCarsException } from "../exceptions/post_car_exception";
import { CreatePostResponse } from "../interfaces/post_car_interface";
import { BaseRepository } from "../repositories/base_repository";
import { UseCase } from "./base";


interface PostCarUseCaseParams {
    car: number,
    available_since: string,
    available_until: string,
    cost: string,
    description?: string | undefined,
    insurance: number
}


export default class PostCarUseCase implements UseCase<CreatePostResponse, PostCarUseCaseParams> {

    async call(params: PostCarUseCaseParams): Promise<CreatePostResponse> {

        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.post("api/v1/cars_post/", {
            car: params.car,
            available_since: params.available_since,
            available_until: params.available_until,
            cost: params.cost,
            description: params.description,
            insurance: params.insurance
        });
        switch (response.status) {
            case 200:
                let createPostResponse: CreatePostResponse = await response.json();
                return createPostResponse;
            case 400:
                throw new NoApprovedCar();
            default:
                throw new PostCarsException();
        }
    }
}