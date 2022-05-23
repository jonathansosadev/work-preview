/* eslint-disable */
import { coinConstants } from '../constants';
import { coinService } from '../services';
import { alertActions, salesActions } from '.';

export const coinActions = {

    dataTable() {
        return dispatch => {
            dispatch(request());

            coinService.coinTable()
                .then(
                    coins => {
                        dispatch(success(coins))
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request() { return { type: coinConstants.COIN_TABLE_REQUEST } }
        function success(coins) { return { type: coinConstants.COIN_TABLE_SUCCESS, coins } }
        function failure(error) { return { type: coinConstants.COIN_TABLE_FAILURE, error } }
    },

    //Registrar/Actualizar monedas
    createCoin(coin, user) {
        return dispatch => {
            dispatch(request(coin));

            coinService.coinCreate(coin)
                .then(
                    coin => { 
                        dispatch(success());
                        dispatch(alertActions.success('¡Se ha registrado la información correctamente!'));

                        //Actualizar en el storage venta, monedas, productos y terminales de la sucursal 
                        dispatch(salesActions.salesDataFormUpdate( user.agency.id ));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(coin) { return { type: coinConstants.COIN_CREATE_REQUEST, coin } }
        function success(coin) { return { type: coinConstants.COIN_CREATE_SUCCESS, coin } }
        function failure(error) { return { type: coinConstants.COIN_CREATE_FAILURE, error } }
    },

    //Obtenr información moneda
    getCoin(id) {
        return dispatch => {
            dispatch(request(id));

            coinService.coinGet(id)
                .then(
                    coin => {
                        dispatch(success(coin));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: coinConstants.COIN_GET_REQUEST, id } }
        function success(coin) { return { type: coinConstants.COIN_GET_SUCCESS, coin } }
        function failure(error) { return { type: coinConstants.COIN_GET_FAILURE, error } }
    },

    //Actualizar información sede
    updateCoin(id, coin) {
        return dispatch => {
            dispatch(request(coin));

            coinService.coinUpdate(id,coin)
                .then(
                    coin => {
                        dispatch(success(coin));
                        dispatch(alertActions.success('Los datos han sido actualizados correctamente'));
                    },
                    error => {
                        dispatch(failure(error.toString()));
                        dispatch(alertActions.error(error.toString()));
                    }
                );
        };

        function request(id) { return { type: coinConstants.COIN_UPDATE_REQUEST, id } }
        function success(coin) { return { type: coinConstants.COIN_UPDATE_SUCCESS, coin } }
        function failure(error) { return { type: coinConstants.COIN_UPDATE_FAILURE, error } }
    },

    //Actualizar información carrera
    listCoins() {
        return dispatch => {
            dispatch(request());

            coinService.coinList()
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

        function request() { return { type: coinConstants.COIN_SELECT_REQUEST } }
        function success(list) { return { type: coinConstants.COIN_SELECT_SUCCESS, list } }
        function failure(error) { return { type: coinConstants.COIN_SELECT_FAILURE, error } }
    }
};
