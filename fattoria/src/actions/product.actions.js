/* eslint-disable */
import { productConstants } from '../constants';
import { productService } from '../services';
import { alertActions, salesActions } from './';

export const productActions = {

    dataTable() {
        return dispatch => {
            dispatch(request());

            productService.productTable()
                .then(
                    products => {
                        dispatch(success(products))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: productConstants.PRODUCT_TABLE_REQUEST } }
        function success(products) { return { type: productConstants.PRODUCT_TABLE_SUCCESS, products } }
        function failure(error) { return { type: productConstants.PRODUCT_TABLE_FAILURE, error } }
    },

    dataTableHistory(user, pageIndex, pageSize, sortBy, filters) {
        return dispatch => {
            dispatch(request());

            productService.productTableHistory(user, pageIndex, pageSize, sortBy, filters)
                .then(
                    products => {
                        dispatch(success(products))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: productConstants.PRODUCT_TABLE_REQUEST } }
        function success(products) { return { type: productConstants.PRODUCT_TABLE_SUCCESS, products } }
        function failure(error) { return { type: productConstants.PRODUCT_TABLE_FAILURE, error } }
    },

    //Registrar producto
    createProduct(product, user) {
        return dispatch => {
            dispatch(request(product));

            productService.productCreate(product)
                .then(
                    product => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la producto correctamente!'));

                        //Actualizar en el storage venta, monedas, productos y terminales de la sucursal 
                        dispatch(salesActions.salesDataFormUpdate( user.agency.id ));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(product) { return { type: productConstants.PRODUCT_CREATE_REQUEST, product } }
        function success(product) { return { type: productConstants.PRODUCT_CREATE_SUCCESS, product } }
        function failure(error) { return { type: productConstants.PRODUCT_CREATE_FAILURE, error } }
    },

    //Obtenr información producto
    getProduct(id) {
        return dispatch => {
            dispatch(request(id));

            productService.productGet(id)
                .then(
                    product => {
                        dispatch(success(product));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: productConstants.PRODUCT_GET_REQUEST, id } }
        function success(product) { return { type: productConstants.PRODUCT_GET_SUCCESS, product } }
        function failure(error) { return { type: productConstants.PRODUCT_GET_FAILURE, error } }
    },

    //Actualizar información producto
    updateProduct(id, product, user) {
        return dispatch => {
            dispatch(request(product));

            productService.productUpdate(id,product)
                .then(
                    product => {
                        dispatch(success(product));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));

                        //Actualizar en el storage venta, monedas, productos y terminales de la sucursal 
                        dispatch(salesActions.salesDataFormUpdate( user.agency.id ));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: productConstants.PRODUCT_UPDATE_REQUEST, id } }
        function success(product) { return { type: productConstants.PRODUCT_UPDATE_SUCCESS, product } }
        function failure(error) { return { type: productConstants.PRODUCT_UPDATE_FAILURE, error } }
    },

    //Obtener listado de productos
    listProducts() {
        return dispatch => {
            dispatch(request());

            productService.productList()
                .then(
                    list => {
                        dispatch(success(list));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: productConstants.PRODUCT_SELECT_REQUEST } }
        function success(list) { return { type: productConstants.PRODUCT_SELECT_SUCCESS, list } }
        function failure(error) { return { type: productConstants.PRODUCT_SELECT_FAILURE, error } }
    },

    //Obtener listado de productos y ofertas
    listProductsOffers(idAgency) {
        return dispatch => {
            dispatch(request());

            productService.productOfferList(idAgency)
                .then(
                    list => {
                        dispatch(success(list));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: productConstants.PRODUCT_OFFER_REQUEST } }
        function success(list) { return { type: productConstants.PRODUCT_OFFER_SUCCESS, list } }
        function failure(error) { return { type: productConstants.PRODUCT_OFFER_FAILURE, error } }
    }
};
