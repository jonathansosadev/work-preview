import React from 'react';
import {Housings} from './Housings';
import {Reservations} from './Reservations';
import {BookingsReservationReport} from './BookingsReservationReport';
import {ImportHousings} from './ImportHousings';
import {ImportReservations} from './ImportReservations';
import {HousingsAdd} from './HousingsAdd';
import {HousingsEdit} from './HousingsEdit';
import {ReservationsAdd} from './ReservationsAdd';
import {ReservationsEdit} from './ReservationsEdit';
import {Billing} from './Billing';
import {SubscriptionNumber} from './SubscriptionNumber';
import {SubscriptionSelectPlan} from './SubscriptionSelectPlan';
import {SubscriptionPayment} from './SubscriptionPayment';
import {SubscriptionPaymentInfo} from './SubscriptionPaymentInfo';
import {DocumentsEntryForms} from './DocumentsEntryForms';
import {DocumentsReservationEntryForms} from './DocumentsReservationEntryForms';
import {DocumentsContracts} from './DocumentsContracts';
import {DocumentsAlloggiati} from './DocumentsAlloggiati';
import {DocumentsIDEV} from './DocumentsIDEV';
import {DocumentsMossos} from './DocumentsMossos';
import {DocumentsEntryFormsGuestbook} from './DocumentsEntryFormsGuestbook';
import {Account} from './Account';
import {NewProperties} from './NewProperties';
import {Login} from './Login';
import {ForgotPassword} from './ForgotPassword';
import {RegisterType} from './RegisterType';
import {RegisterNumber} from './RegisterNumber';
import {RegisterPMS} from './RegisterPMS';
import {RegisterForm} from './RegisterForm';
import {RegisterPricing} from './RegisterPricing';
import {PmsGuestyOriginRegister} from './PmsGuestyOriginRegister';
import {PmsCloudbedsOriginRegister} from './PmsCloudbedsOriginRegister';
import {PmsLodgifyOriginRegister} from './PmsLodgifyOriginRegister';
import {PmsRentalsUnitedOriginRegister} from './PmsRentalsUnitedOriginRegister';
import {PmsHostawayOriginRegister} from './PmsHostawayOriginRegister';
import {PmsOctorateOriginRegister} from './PmsOctorateOriginRegister';
import {PmsBookingOriginRegister} from './PmsBookingOriginRegister';
import {PmsPlanyoOriginRegister} from './PmsPlanyoOriginRegister';
import {PmsSmoobuOriginRegister} from './PmsSmoobuOriginRegister';
import {PmsMewsOriginRegister} from './PmsMewsOriginRegister';
import {PmsBookingsyncOriginRegister} from './PmsBookingsyncOriginRegister';
import {PmsVillas365OriginRegister} from './PmsVillas365OriginRegister';
import {ConnectProperties} from './ConnectProperties';
import {MonthlyReport} from './MonthlyReport';
import {SelfCheckin} from './SelfCheckin';
import {AccessProviders} from './AccessProviders';
import {PropertiesConections} from './PropertiesProtections';
import {OmnitecAccessProviderConnect} from './OmnitecAccessProviderConnect'
import {NukiAccessProviderConnect} from './NukiAccessProviderConnect';
import {KeycafeAccessProviderConnect} from './KeycafeAccessProviderConnect';
import {AkilesAccessProviderConnect} from './AkilesAccessProviderConnect';
import {RemoteLockAccessProviderConnect} from './RemoteLockAccessProviderConnect';
import {KeynestAccessProviderConnect} from './KeynestAccessProviderConnect';
import {HomeitAccessProviderConnect} from './HomeitAccessProviderConnect';
import {SaltoAccessProviderConnect} from './SaltoAccessProviderConnect';
import {TtlockAccessProviderConnect} from './TtlockAccessProviderConnect';
import {MondiseAccessProviderConnect} from './MondiseAccessProviderConnect';
import {RoomaticAccessProviderConnect} from './RoomaticAccessProviderConnect';
import {BookingsGuestReport} from './BookingsGuestReport';
import {PmsResharmonicsOriginRegister} from './PmsResharmonicsOriginRegister';
import {PmsRentlioOriginRegister} from './PmsRentlioOriginRegister';
import {PmsFantasticstayOriginRegister} from './PmsFantasticstayOriginRegister';
import {PmsApaleoOriginRegister} from './PmsApaleoOriginRegister';
import {AfterRegistration} from './AfterRegistration';
import {PmsEviivoOriginRegister} from './PmsEviivoOriginRegister';
import {PmsMyvrOriginRegister} from './PmsMyvrOriginRegister';
import {PmsHoteligaOriginRegister} from './PmsHoteligaOriginRegister';
import {PmsOwnerrezOriginRegister} from './PmsOwnerrezOriginRegister';
import {PmsHostifyOriginRegister} from './PmsHostifyOriginRegister';
import {PmsChannexOriginRegister} from './PmsChannexOriginRegister';
import {PmsEzeeOriginRegister} from './PmsEzeeOriginRegister';
import {Upselling} from './Upselling';
import { SuperHogPropertyProtection } from './SuperHogPropertyProtection';

const Guest = React.lazy(() => import('./Guest'));

const pages = {
  AfterRegistration,
  Reservations,
  ReservationsAdd,
  ReservationsEdit,
  ImportReservations,
  BookingsReservationReport,
  Housings,
  HousingsAdd,
  ImportHousings,
  HousingsEdit,
  Billing,
  SubscriptionNumber,
  SubscriptionSelectPlan,
  SubscriptionPayment,
  SubscriptionPaymentInfo,
  Guest,
  DocumentsEntryForms,
  DocumentsReservationEntryForms,
  DocumentsContracts,
  DocumentsAlloggiati,
  DocumentsMossos,
  DocumentsIDEV,
  DocumentsEntryFormsGuestbook,
  Account,
  NewProperties,
  Login,
  ForgotPassword,
  RegisterType,
  RegisterNumber,
  RegisterPMS,
  RegisterForm,
  RegisterPricing,
  PmsGuestyOriginRegister,
  PmsLodgifyOriginRegister,
  PmsRentalsUnitedOriginRegister,
  PmsHostawayOriginRegister,
  PmsOctorateOriginRegister,
  PmsBookingOriginRegister,
  PmsPlanyoOriginRegister,
  PmsSmoobuOriginRegister,
  PmsMewsOriginRegister,
  PmsBookingsyncOriginRegister,
  PmsVillas365OriginRegister,
  ConnectProperties,
  MonthlyReport,
  SelfCheckin,
  PmsCloudbedsOriginRegister,
  BookingsGuestReport,
  AccessProviders,
  PropertiesConections,
  OmnitecAccessProviderConnect,
  NukiAccessProviderConnect,
  KeycafeAccessProviderConnect,
  AkilesAccessProviderConnect,
  RemoteLockAccessProviderConnect,
  KeynestAccessProviderConnect,
  HomeitAccessProviderConnect,
  SaltoAccessProviderConnect,
  TtlockAccessProviderConnect,
  MondiseAccessProviderConnect,
  RoomaticAccessProviderConnect,
  PmsResharmonicsOriginRegister,
  PmsRentlioOriginRegister,
  PmsFantasticstayOriginRegister,
  PmsEzeeOriginRegister,
  PmsApaleoOriginRegister,
  PmsEviivoOriginRegister,
  PmsMyvrOriginRegister,
  PmsHoteligaOriginRegister,
  PmsOwnerrezOriginRegister,
  PmsHostifyOriginRegister,
  PmsChannexOriginRegister,
  Upselling,
  SuperHogPropertyProtection
};

export default pages;
