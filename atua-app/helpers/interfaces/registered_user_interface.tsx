export interface RegisteredUserResponse {
    code_transaction: string;
    data: Data;
}

export interface Data {
    phone: string;
    user: User;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: null;
}
