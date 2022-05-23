export interface UserResponseInterface {
    code_transaction?: string | undefined;
    data?: Data | undefined;
}

export interface Data {
    refresh?: string | undefined;
    access?: string | undefined;
}
