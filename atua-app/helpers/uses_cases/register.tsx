import { BaseRegisterException, DuplicateUser, InvalidPhone } from '../exceptions/register_exceptions';
import { RegisteredUserResponse } from '../interfaces/registered_user_interface';
import { BaseRepository } from '../repositories/base_repository';
import { UseCase } from './base';

export interface RegisterUseCaseParams {
    pin: string,
    email: string,
    is_terms_accepted: boolean,
    country?: number | undefined
}


export default class RegisterUseCase implements UseCase<RegisteredUserResponse, RegisterUseCaseParams>{
    async call(params: RegisterUseCaseParams): Promise<RegisteredUserResponse> {
        let baseRepository: BaseRepository = new BaseRepository();

        let response: any = await baseRepository.post("api/v1/users/register/", {
            pin: params.pin,
            email: params.email,
            is_terms_accepted: params.is_terms_accepted,
            country: params.country
        });
        switch (response.status) {
            case 200:
                let registeredUserResponse: RegisteredUserResponse = await response.json();
                return registeredUserResponse;
            case 400:
                let responseData = await response.json();

                if (responseData.message.hasOwnProperty("phone")) {
                    throw new InvalidPhone();
                } else {
                    throw new DuplicateUser();
                }
            default:
                throw new BaseRegisterException();
        }

    }
}