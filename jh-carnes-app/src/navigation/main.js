import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import NavigationOptions from './navigation-options';
import {connect} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import Home from '../screens/home/home';
import Login from '../screens/login/login';
import Register from '../screens/register/register';
import Profile from '../screens/profile/profile';
import Catering from '../screens/catering/catering';
import Menu from '../screens/menu/menu';
import Reservations from '../screens/reservations/reservations';
import HomeAdmin from '../screens/admin/home/Home';
import CreatePlate from '../screens/admin/createplate/CreatePlate';
import Reset from '../screens/password/reset';
import EnterCode from '../screens/password/enter-code';
import NewPassword from '../screens/password/new-password';
import Logout from '../screens/logout/logout';
import NewReservation from '../screens/reservations/new-reservation';
import Foods from '../screens/admin/foods/Foods';
import Reservation from '../screens/admin/reservation/Reservation';
import Config from '../screens/admin/config/Config';
import Clients from '../screens/admin/clients/Clients';
import Events from '../screens/admin/eventlist/Events';
import Billing from '../screens/admin/billing/Billing';
import ProfileAdmin from '../screens/admin/profileadmin/ProfileAdmin';
import EventsClient from '../screens/events/events';
import EventsAdmin from '../screens/admin/events/Events';
import CreateEvent from '../screens/admin/createevent/CreateEvent';
import AuditPointReport from '../screens/admin/auditpointreport/AuditPointReport';
import {Order} from '../screens/menu/order';
import {OrderConfirmation} from '../screens/menu/order-confirmation';
import ModalReservationEvent from '../screens/events/modal-reservation-event';

const MainNavigator = createStackNavigator(
  {
    Home: Home,
    HomeAdmin: {
      screen: HomeAdmin,
      header: null,
    },
    AuditPointReport,
    Billing,
    Events,
    ProfileAdmin,
    EventsAdmin,
    Reservation,
    Foods,
    Clients,
    CreatePlate,
    Config,
    Login: Login,
    Register: Register,
    Catering: Catering,
    Menu: Menu,
    Profile: Profile,
    Reservations: Reservations,
    Reset: Reset,
    EnterCode: EnterCode,
    NewPassword: NewPassword,
    Logout: Logout,
    NewReservation: NewReservation,
    EventsClient: EventsClient,
    CreateEvent,
    Order,
    OrderConfirmation,
    ModalReservationEvent
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: NavigationOptions,
  },
);

const Container = createAppContainer(MainNavigator);

class _Container extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'QUIT_LOADING',
    });
  }

  render() {
    return (
      <>
        <Spinner visible={this.props.loading} textContent="" size="large" />
        <Container />
      </>
    );
  }
}

export default connect(state => {
  return {
    loading: state.loading,
  };
})(_Container);
