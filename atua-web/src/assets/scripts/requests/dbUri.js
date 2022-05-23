// old/not updated URLS
export const activationEP = "api/users/activation/";
export const resendActivationEP = "api/users/resend_activation/";

export const forgotPassEP = "api/users/reset_password/";
export const resetPassEP = "api/users/reset_password_confirmation/";

export const changeEmailEP = "api/users/set_email/";

//AUTH
export const deleteUserEP = "api/users/";

//PROTECTED
export const userProfileInfoEP = "api/users/me/profile_data";

export const publishCarEP = (publishType) => `api/rental/${publishType}/post/`;

export const availableCarsEP = "api/rental/post/";

export const checkDateEP = "api/rental/post/check-availability/";

export const reservationEP = (publishType) =>
  `api/rental/${publishType}/reservations/`;

export const paymentsEP = "api/payments/mp/";

//OPEN

export const getBrandModelsEP = "api/brand/models/";

export const getModelPricesEP = "api/model/year-price/";

export const branchOfficeEP = "api/location/branch_office/";

// *********************************************************

//UPDATED
//BASE URL
export const apiURI = process.env.REACT_APP_API_URL;

//AUTH

export const requestValidationCodeEP = "api/v1/phone/sendcode/";

export const sendValidationCodeEP = "api/v1/phone/sendcode/";

export const registerEP = "api/v1/users/register/";

export const logInEP = "api/v1/auth/token/";

export const refreshTokenEP = "api/v1/auth/token/refresh/";

//Resources
export const documentTypesEP = "api/v1/document_types/";

export const getCountriesEP = "api/v1/country/";

export const getProvincesEP = "api/v1/province/";

export const getCitiesEP = "api/v1/cities/";

export const getBrandsEP = "api/v1/cars/brands_cars/";

export const getModelsEP = "api/v1/cars/models_cars/";

//USER
export const userInfoEP = "api/v1/users/details/";

export const pinChangeEP = "api/v1/users/change_pin/";

export const documentationRegisterEP = "api/v1/users/documents/register/";

export const addressEP = "api/v1/address/";

//CARS
//Register and get user cars
export const carEP = "api/v1/cars/my_cars/";

export const carDetailEP = "api/v1/car_detail/";

//Documentation
export const carDocEP = "api/v1/cars/documents/";

export const carDocExtEP = "api/v1/cars/documents_exterior/";

export const carDocIntEP = "api/v1/cars/documents_interior/";
