import { UseCaseNoParams } from './base';
import { BaseRepository } from '../repositories/base_repository';
import { UserDetailsException } from '../exceptions/user_details_exceptions';
import { AuthSession } from '../utils/auth_session';
import { UserDetailsInterface } from '../interfaces/user_details_interface';


export default class UserDetailsUseCase implements UseCaseNoParams<UserDetailsInterface> {

    async call(): Promise<UserDetailsInterface> {

        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.get("api/v1/users/details/");
        switch (response.status) {
            case 200:
                let userDetailsResponse: UserDetailsInterface = await response.json();
                return userDetailsResponse;
            default:
                throw new UserDetailsException();
        }
    }
}