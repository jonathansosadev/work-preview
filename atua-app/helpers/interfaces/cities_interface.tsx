import { Province } from "./provinces_interfaces";

export interface Cities {
    code_transaction: string;
    data: City[];
}

export interface City {
    id: number;
    name: string;
    province: Province;
}
