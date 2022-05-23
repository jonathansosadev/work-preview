import { UseCaseNoReturn } from './base';
import { BaseRepository } from '../repositories/base_repository';
import { AuthSession } from '../utils/auth_session';
import { NoExistUser, LoginException } from '../exceptions/login_exceptions';
import UserDetailsUseCase from './user_details';
import { UserDetailsInterface } from '../interfaces/user_details_interface';

interface LoginUseCaseParams {
    username: number;
    password: number;
}

export default class LoginUseCase implements UseCaseNoReturn<LoginUseCaseParams> {

    private userDetailsUseCase: UserDetailsUseCase = new UserDetailsUseCase();
    private authSession: AuthSession = AuthSession.getInstance();


    async call(params: LoginUseCaseParams): Promise<void> {


        let baseRepository: BaseRepository = new BaseRepository();
        let response: any = await baseRepository.post("api/v1/auth/token/", {
            username: params.username,
            password: params.password,
        });
        switch (response.status) {
            case 200:
                await this.startSession(response);
                break;
            case 401:
                throw new NoExistUser();
            default:
                throw new LoginException();
        }
    }

    private async startSession(response: any) {
        try {
            await this.authSession.start(await response.json());
            let userDetailsResponse: UserDetailsInterface = await this.userDetailsUseCase.call();
            await this.authSession.updateUserDetails(userDetailsResponse);
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}



