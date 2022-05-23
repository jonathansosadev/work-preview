import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserResponseInterface } from '../interfaces/auth_session_intefaces';
import { UserDetailsInterface } from '../interfaces/user_details_interface';
import localStorageConstants from '../../local_storage_constants'; // Importacion del config



export default class LocalStorage {

    constructor() { }

    async setAuth(authSession: UserResponseInterface) {
        await AsyncStorage.setItem(localStorageConstants.userToken, JSON.stringify(authSession.data));
    }

    async setUserDetails(userDetails: UserDetailsInterface) {
        await AsyncStorage.setItem(localStorageConstants.userDetails, JSON.stringify(userDetails.data));
    }

    async getAuth() {
        let localStorageAuth = await AsyncStorage.getItem(localStorageConstants.userToken);
        return localStorageAuth;
    }

    async getUserDetails() {
        let localStorageUserDetails = await AsyncStorage.getItem(localStorageConstants.userDetails);
        return localStorageUserDetails;
    }
}