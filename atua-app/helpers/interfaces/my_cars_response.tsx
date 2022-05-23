export interface MyCarsResponse {
    code_transaction: string;
    data: Data;
}

export interface Data {
    count: number;
    next: string | undefined;
    previous: string | undefined;
    results: MyCars[];
}

export interface MyCars {
    id: number;
    plate: string;
    transmission: string;
    kilometers: number;
    year: number;
    doors: number;
    car_model: CarModel;
    fuel_type: string;
    date_created: Date;
    status: number;
    model_zero_price: any[];
    model_price: any;
    address: Address;
}

export interface Address {
    id: number;
    zip_code: string;
    street_name: string;
    street_number: string;
    city: City;
    description: string;
    default: boolean;
}

export interface City {
    id: number;
    name: string;
    province: Province;
}

export interface Province {
    id: number;
    name: string;
    country: Country;
}

export interface Country {
    id: number;
    name: string;
}

export interface CarModel {
    brand: Brand;
    logo_url: string;
    id: number;
    description: null;
    price_from: string;
    price_to: string;
    summary: string;
}

export interface Brand {
    id: number;
    logo_url: string;
    name: string;
    summary: string;
    price_from: string;
    price_to: string;
}


