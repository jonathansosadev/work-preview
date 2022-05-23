/* eslint-disable */
import './assets/css/styles.css'; 
import React, { useEffect } from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { history, Role } from './helpers';
import { alertActions } from './actions';
import { PrivateRoute } from './components';
import HomePage from './views/HomePage';
import LoginPage from './views/LoginPage';
import LandingPage from './views/LandingPage'

import ProfilePage from './views/profile/ProfilePage'
import UsersListPage from './views/users/UsersListPage'
import UserCreatePage from './views/users/UserCreatePage';
import UserUpdatePage from './views/users/UserUpdatePage';
import ClientUpdatePage from './views/users/ClientUpdatePage';

//Sucursal
import AgencyListPage from './views/agency/AgencyList';
import AgencyCreatePage from './views/agency/AgencyCreate';
import AgencyUpdatePage from './views/agency/AgencyUpdate';

//Catalogo
import ProductListPage from './views/product/ProductList';
import ProductCreatePage from './views/product/ProductCreate';
import ProductUpdatePage from './views/product/ProductUpdate';
import ProductListHistoryPage from './views/product/ProductHistory';

//Inventario
import InventoryCreatePage from './views/inventory/InventoryCreate';
import InventoryReweighPage from './views/inventory/InventoryReweigh';
import InventoryReadjustmentPage from './views/inventory/inventoryReadjustment';
import InventoryResetPage from './views/inventory/inventoryReset';

//Ventas
import SalesListUserPage from './views/sales/SalesListUser';
import SalesListManagerPage from './views/sales/SalesListManager';
import SalesListDailyPage from './views/sales/SalesListDaily';
import SalesCreatePage from './views/sales/SalesCreate';
import SalesCreateOfflinePage from './views/sales/SalesCreateOffline';
import CreditCreatePage from './views/sales/CreditCreate';

//Monedas
import CoinListPage from './views/coin/CoinList';
import CoinCreatePage from './views/coin/CoinCreate';
//Terminales
import TerminalListPage from './views/terminal/TerminalList';
import TerminalCreatePage from './views/terminal/TerminalCreate';
import TerminalUpdatePage from './views/terminal/TerminalUpdate';

//reportes
import InventorySellPage from './views/reports/inventorySell';
import InventoryOfferPage from './views/reports/inventoryOffers';
import InventoryHistoryPage from './views/reports/inventoryHistory';
import InventoryListPage from './views/reports/InventoryList';
import InventoryReportPage from './views/reports/inventoryReport';
import BalanceReportPage from './views/reports/balanceReport';
import InventoryReportDailyPage from './views/reports/inventoryReportDaily';
import PaymentMethodsPage from './views/reports/PaymentMethods';
import DepartureListPage from './views/reports/departureList';
import InventoryReportPlusPage from './views/reports/inventoryReportPlus';
import InventoryAdjustmentHistoryPage from './views/reports/inventoryAdjustmentHistory';
import CronHistoryPage from './views/reports/cronHistory';
//Salidas por degustación, autoconsumo o donación
import DeparturePage from './views/departures/departureCreate';

//ofertas
import OfferListPage from './views/offer/OfferList';
import OfferCreatePage from './views/offer/OfferCreate';
//Reporte de ofertas historial
import OfferReportPage from './views/reports/offerReport';

//Caja
import BoxCreatePage from './views/box/BoxCreate';
import BoxWithdrawalPage from './views/box/BoxWithdrawal';
import BoxClosePage from './views/box/BoxClose';
import BoxCorrectionPage from './views/box/boxCorrection';
//Reporte de caja
import BoxReportPage from './views/reports/BoxReport';
import BoxCloseReportPage from './views/reports/boxCloseReport';

//clientes
import ClientListPage from './views/reports/clientList';

function App() {
    //const alert = useSelector(state => state.alert);
    const dispatch = useDispatch();

    useEffect(() => {
        history.listen((location, action) => {
            // clear alert on location change
            dispatch(alertActions.clear());
        });
    }, []);

    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/" component={LandingPage} />
                <Route path="/login" component={LoginPage} />
                <PrivateRoute path="/profile" component={ProfilePage} />
                <PrivateRoute path="/home" component={HomePage} />

                {/* Usuarios */}
                <PrivateRoute path="/users" roles={[Role.Admin, Role.Supervisor]} component={UsersListPage} />
                <PrivateRoute path="/register-user" roles={[Role.Admin, Role.Supervisor]} component={UserCreatePage} />
                <PrivateRoute path="/update-user" roles={[Role.Admin, Role.Supervisor]} component={UserUpdatePage} />
                <PrivateRoute path="/update-client" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={ClientUpdatePage} />

                {/* Sucursales */}
                <PrivateRoute path="/agency" roles={[Role.Admin, Role.Supervisor]} component={AgencyListPage} />
                <PrivateRoute path="/register-agency" roles={[Role.Admin, Role.Supervisor]} component={AgencyCreatePage} />
                <PrivateRoute path="/update-agency" roles={[Role.Admin, Role.Supervisor]} component={AgencyUpdatePage} />

                {/* Productos */}
                <PrivateRoute path="/product" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={ProductListPage} />
                <PrivateRoute path="/register-product" roles={[Role.Admin, Role.Supervisor]} component={ProductCreatePage} />
                <PrivateRoute path="/update-product" roles={[Role.Admin, Role.Supervisor]} component={ProductUpdatePage} />
                <PrivateRoute path="/product-history" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={ProductListHistoryPage} />

                {/* Inventario */}
                <PrivateRoute path="/inventory" roles={[Role.Admin, Role.Supervisor, Role.Manager, Role.Cashier]} component={InventoryListPage} />
                <PrivateRoute path="/register-inventory" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryCreatePage} />
                <PrivateRoute path="/inventory-reweigh" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryReweighPage} />
                <PrivateRoute path="/readjustment" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryReadjustmentPage} />
                <PrivateRoute path="/inventory-reset" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryResetPage} />

                {/* Ventas */}
                <PrivateRoute path="/sales" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={SalesListManagerPage} />
                <PrivateRoute path="/offline-sales" roles={[ Role.Cashier, Role.Admin]} component={SalesCreateOfflinePage} />
                <PrivateRoute path="/sales-daily" roles={[Role.Cashier]} component={SalesListDailyPage} />
                <PrivateRoute path="/register-sale" roles={[ Role.Cashier, Role.Admin]} component={SalesCreatePage} />
                <PrivateRoute path="/sales-user" roles={[ Role.Cashier,Role.Admin, Role.Manager]} component={SalesListUserPage} />
                <PrivateRoute path="/sales-credit" roles={[ Role.Manager ]} component={CreditCreatePage} />

                {/* Monedas */}
                <PrivateRoute path="/coin" roles={[Role.Admin, Role.Supervisor]} component={CoinListPage} />
                <PrivateRoute path="/register-coin" roles={[ Role.Admin, Role.Supervisor]} component={CoinCreatePage} />

                {/* Terminales */}
                <PrivateRoute path="/terminal" roles={[Role.Admin, Role.Supervisor]} component={TerminalListPage} />
                <PrivateRoute path="/register-terminal" roles={[Role.Admin, Role.Supervisor]} component={TerminalCreatePage} />
                <PrivateRoute path="/update-terminal" roles={[Role.Admin, Role.Supervisor]} component={TerminalUpdatePage} />

                {/* Salidas por degustación, autoconsumo o donación */}
                <PrivateRoute path="/departure" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={DeparturePage} />

                {/* Ofertas */}
                <PrivateRoute path="/offer" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={OfferListPage} />
                <PrivateRoute path="/create-offer" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={OfferCreatePage} />

                {/* Caja */}
                <PrivateRoute path="/box-opening" roles={[Role.Admin, Role.Manager]} component={BoxCreatePage} />
                <PrivateRoute path="/box-withdrawal" roles={[Role.Admin, Role.Manager]} component={BoxWithdrawalPage} />
                <PrivateRoute path="/box-close" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={BoxClosePage} />
                <PrivateRoute path="/box-correction" roles={[Role.Admin]} component={BoxCorrectionPage} />

                {/* Reportes */}
                <PrivateRoute path="/inventory-sell" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventorySellPage} />
                <PrivateRoute path="/inventory-history" roles={[Role.Admin, Role.Supervisor]} component={InventoryHistoryPage} />
                <PrivateRoute path="/inventory-report" roles={[Role.Admin, Role.Supervisor]} component={InventoryReportPage} />
                <PrivateRoute path="/balance-report" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={BalanceReportPage} />
                <PrivateRoute path="/inventory-report-daily" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryReportDailyPage} />
                <PrivateRoute path="/payment-methods-report" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={PaymentMethodsPage} />
                <PrivateRoute path="/departures" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={DepartureListPage} />
                <PrivateRoute path="/inventory-report-plus" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryReportPlusPage} />
                <PrivateRoute path="/inventory-adjustment-history" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryAdjustmentHistoryPage} />
                <PrivateRoute path="/offer-history" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={OfferReportPage} />
                <PrivateRoute path="/cron-history" roles={[Role.Admin]} component={CronHistoryPage} />
                <PrivateRoute path="/inventory-offer" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={InventoryOfferPage} />
                <PrivateRoute path="/box-report" roles={[Role.Admin, Role.Supervisor]} component={BoxReportPage} />
                <PrivateRoute path="/box-close-report" roles={[Role.Admin, Role.Supervisor, Role.Manager]} component={BoxCloseReportPage} />
                <PrivateRoute path="/client-list" roles={[Role.Admin, Role.Supervisor, Role.Manager, Role.Cashier]} component={ClientListPage} />
                <Redirect from="*" to="/" />
            </Switch>
        </Router>     
    );
}

export default App