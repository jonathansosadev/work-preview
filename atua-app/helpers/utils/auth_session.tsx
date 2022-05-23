import { UserResponseInterface } from "../interfaces/auth_session_intefaces";
import { UserDetailsInterface } from "../interfaces/user_details_interface";
import LocalStorage from './local_storage';


export class AuthSession {
    private static instance: AuthSession;
    private constructor() { }

    authSession?: UserResponseInterface | undefined;
    userDetails?: UserDetailsInterface | undefined;
    localStorage: LocalStorage = new LocalStorage();

    isLogged?: boolean | undefined;

    public static getInstance(): AuthSession {
        if (!AuthSession.instance) {
            AuthSession.instance = new AuthSession();
        }
        return AuthSession.instance;
    }
    public async start(authSession: UserResponseInterface) {
        this.authSession = authSession;
        await this.localStorage.setAuth(authSession);
    }

    public async updateUserDetails(userDetails: UserDetailsInterface) {
        this.userDetails = userDetails;
        await this.localStorage.setUserDetails(userDetails);
    }

    public async updateIsLogged() {
        let logged = await this.localStorage.getAuth() !== null;
        this.isLogged = logged;
    }

}
