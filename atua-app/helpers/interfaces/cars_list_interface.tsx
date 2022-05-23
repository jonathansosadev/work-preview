export interface CarsList {
    count: number;
    next: string | undefined;
    previous: string | undefined;
    results: Car[];
}

export interface Car {
    id: number;
    plate: string;
    transmission: number;
    kilometers: number;
    year: number;
    doors: number;
    car_model: number;
    car_brand: string;
    fuel_type: number;
    date_created: Date;
    status: number;
    model_zero_price: string;
    model_price: string;
    address_id: number;
}
