import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import {useQueryClient, useQuery} from 'react-query';
import {useLocation} from 'react-router-dom';
import moment, {Moment} from 'moment';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import type {
  FormMoment,
  Reservation,
  ReservationSource,
  Room,
  SelectOption,
  ShortHousing,
  User,
} from '../../../utils/types';
import {LightReservation, Location} from '../../../utils/types';
import {
  ALL_GROUP_TYPES_OPTIONS,
  COUNTRY_CODES,
  GROUP_GROUP_TYPES_OPTIONS,
  MAX_NUMBER_OF_GUESTS,
  RESPONSIBLE_ME_OPTION,
  SECURITY_DEPOSIT_STATUSES,
  SINGLE_GROUP_TYPES_OPTIONS,
  STAT_TYPES,
  STAT_TYPES_WITHOUT_OCCUPIED_ROOMS,
  TOURIST_GROUP_GROUP_TYPE_OPTION,
} from 'utils/constants';
import {formatDate} from '../../../utils/date';
import {LABEL_PLACEMENT} from '../../common/Loader';
import {UPSELLING_PAYMENTS_STATUSES} from '../ReservationPayments/utils';
import {RESERVATION_PAYMENT_STATUSES} from '../ReservationPayments';
import i18n from 'i18n';
import api, {queryFetcher} from '../../../api';
import {useErrorToast, useIsFormTouched} from 'utils/hooks';
import {getRequiredOrOptionalFieldLabel} from 'utils/common';
import {getCountryCode, getStatType} from 'utils/housing';
import {BOOKING_FORM_FEES_NAMES} from '../HousingBookingPaymentsSection';
import FormValueController from '../FormValueController';
import Section from '../Section';
import Select from '../Select';
import DateRangePicker from '../DateRangePicker';
import PhoneInput from '../PhoneInput';
import CreatableSelect from '../CreatableSelect';
import QueriedInfiniteScrollSelect from '../QueriedInfiniteScrollSelect';
import {InputController} from '../Input';
import {HousingLoaderWrapper} from './styled';
import {RelativeWrapper, FieldsGridLayout} from 'styled/common';

const MIN_NUMBER_OF_NIGHTS = 1;
const MIN_NUMBER_OF_GUESTS = 1;
const DEFAULT_NUMBER_OF_GUESTS = 0;
const MIN_PRICE = 0;
const MIN_OCCUPIED_ROOMS = 0;

function fetchCollaborators() {
  return queryFetcher(api.users.ENDPOINTS.collaborators());
}

function fetchRooms() {
  return queryFetcher(api.rooms.ENDPOINTS.all());
}

function getCollaboratorsAsOptions(collaborators: User[]): SelectOption[] {
  if (!Array.isArray(collaborators)) {
    return [RESPONSIBLE_ME_OPTION];
  }

  const options = collaborators.map((c) => {
    return {
      label: c.name,
      value: c.id,
    };
  });
  return [RESPONSIBLE_ME_OPTION, ...options];
}

function getReservationSourcesAsOptions(sources?: ReservationSource[]): SelectOption[] {
  if (!sources) {
    return [];
  }

  return sources.map((source) => {
    return {
      value: source.name,
      label: source.name,
    };
  });
}

function getRoomsAsOptions(rooms: Room[], housingOptionId = ''): SelectOption[] {
  if (!Array.isArray(rooms) || !housingOptionId) {
    return [];
  }

  return rooms
    .filter((r) => {
      const id = r?.housing_id?.replace(/-/g, '');
      return id === housingOptionId;
    })
    .map((r) => {
      return {
        value: r?.external_id as string,
        label: r?.external_name as string,
      };
    });
}

function getMinCheckInDate(countryCode?: string) {
  let date;

  if (countryCode === COUNTRY_CODES.portugal) {
    date = moment().subtract(4, 'days');
  } else {
    date = moment().subtract(1, 'days').startOf('day');
  }

  return date;
}

function getAvailableHousingsCheckInDate(
  date?: Moment | null,
  reservation?: Reservation | LightReservation | null,
) {
  const checkInDate = date || reservation?.check_in_date;

  if (checkInDate) {
    return moment(checkInDate).format('YYYY-MM-DD');
  }
  return '';
}

export type ExtendedHousing = {
  id: string;
  name: string;
  security_deposit_amount: string | null;
  location: Location;
  rooms: Room[];
  is_stat_registration_enabled: boolean;
  is_contract_enabled: boolean;
  security_deposit_status: SECURITY_DEPOSIT_STATUSES;
  stat_account?: {
    id: string;
  };
  default_email_language: string;
  seasons: string[];
  is_self_online_check_in_enabled: boolean;
  is_biometric_match_for_all_enabled: boolean;
  time_zone: string;
  commission_responsibility_for_extra_service: string;
  reservation_payments_status: RESERVATION_PAYMENT_STATUSES;
  upselling_payments_status: UPSELLING_PAYMENTS_STATUSES;
  checkin_online_sending_settings_id: string | null;
  [BOOKING_FORM_FEES_NAMES.charge_fees_to_guest]: string;
  commission_responsibility_for_tourist_tax: string;
};

type ObjectForParams<Type> = {
  [Property in keyof Type]: string;
};

const objectForParams: ObjectForParams<ExtendedHousing> = {
  id: '',
  name: '',
  security_deposit_amount: '',
  location: '',
  rooms: '',
  stat_account: '',
  is_stat_registration_enabled: '',
  is_contract_enabled: '',
  is_biometric_match_for_all_enabled: '',
  security_deposit_status: '',
  default_email_language: '',
  seasons: '',
  is_self_online_check_in_enabled: '',
  time_zone: '',
  reservation_payments_status: '',
  upselling_payments_status: '',
  checkin_online_sending_settings_id: '',
  [BOOKING_FORM_FEES_NAMES?.charge_fees_to_guest]: '',
  commission_responsibility_for_tourist_tax: '',
  commission_responsibility_for_extra_service: '',
};

const paramsArray = Object.keys(objectForParams);

const EXTENDED_HOUSING_FIELD_SET = 'field_set=' + paramsArray.join(',');

function getSpacesAsOptions(housing?: ExtendedHousing) {
  if (housing?.rooms) {
    return housing?.rooms?.map((room: Room) => {
      return {
        label: room.number,
        value: room.id!,
      };
    });
  }

  return [];
}

export type HousingOption = {
  label: string;
  value: string;
  country: string;
  data: ShortHousing;
};

export enum FORM_NAMES {
  housing = 'housing_id',
  space = 'space',
  responsible = 'assigned_to',
  check_in_date = 'check_in_date',
  number_of_nights = 'nights_of_stay',
  children = 'children',
  number_of_guests = 'number_of_guests',
  guest_leader_name = 'default_leader_full_name',
  type = 'type',
  price = 'price',
  deposit = 'deposit',
  occupied_rooms = 'occupied_rooms_quantity',
  external_room_id = 'external_room_id',
  external_room_id_option = 'external_room_id_option',
  check_out_date = 'check_out_date',
  default_phone_number = 'default_phone_number',
  source_name = 'source_name',
  lead_guest_email = 'default_invite_email',
  language = 'language',
  checkin_online_sending_settings_id = 'checkin_online_sending_settings_id',
  booking_reference = 'booking_reference',
}

export type FormTypes = {
  [FORM_NAMES.housing]?: SelectOption;
  [FORM_NAMES.space]?: SelectOption;
  [FORM_NAMES.check_in_date]?: FormMoment;
  [FORM_NAMES.check_out_date]?: FormMoment;
  [FORM_NAMES.number_of_nights]?: string;
  [FORM_NAMES.number_of_guests]?: string;
  [FORM_NAMES.guest_leader_name]?: string;
  [FORM_NAMES.children]?: number;
  [FORM_NAMES.type]?: SelectOption;
  [FORM_NAMES.responsible]?: SelectOption;
  [FORM_NAMES.price]?: string;
  [FORM_NAMES.deposit]?: string;
  [FORM_NAMES.occupied_rooms]?: string;
  [FORM_NAMES.external_room_id]?: string;
  [FORM_NAMES.external_room_id_option]?: SelectOption;
  [FORM_NAMES.default_phone_number]?: string;
  [FORM_NAMES.source_name]?: SelectOption;
  [FORM_NAMES.language]: SelectOption;
  [FORM_NAMES.lead_guest_email]?: string;
  [FORM_NAMES.checkin_online_sending_settings_id]?: string;
  [FORM_NAMES.booking_reference]?: string;
};

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.housing]: i18n.t('required'),
  [FORM_NAMES.space]: false,
  [FORM_NAMES.check_in_date]: i18n.t('required'),
  [FORM_NAMES.number_of_nights]: i18n.t('required'),
  [FORM_NAMES.number_of_guests]: i18n.t('required'),
  [FORM_NAMES.type]: i18n.t('required'),
  [FORM_NAMES.occupied_rooms]: i18n.t('required'),
  [FORM_NAMES.external_room_id]: i18n.t('required'),
  [FORM_NAMES.external_room_id_option]: i18n.t('required'),
  [FORM_NAMES.check_in_date]: i18n.t('required'),
  [FORM_NAMES.check_out_date]: false,
  [FORM_NAMES.price]: false,
  [FORM_NAMES.deposit]: false,
  [FORM_NAMES.children]: false,
  [FORM_NAMES.responsible]: false,
  [FORM_NAMES.guest_leader_name]: false,
  [FORM_NAMES.default_phone_number]: false,
  [FORM_NAMES.source_name]: false,
  [FORM_NAMES.booking_reference]: false,
};

function getRequiredFields(housing?: ExtendedHousing) {
  return INIT_REQUIRED_FIELDS;
}

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.housing]: true,
  [FORM_NAMES.space]: false,
  [FORM_NAMES.responsible]: true,
  [FORM_NAMES.check_in_date]: true,
  [FORM_NAMES.check_out_date]: true,
  [FORM_NAMES.number_of_guests]: true,
  [FORM_NAMES.guest_leader_name]: true,
  [FORM_NAMES.booking_reference]: true,
  [FORM_NAMES.default_phone_number]: true,
  [FORM_NAMES.source_name]: true,
  [FORM_NAMES.number_of_nights]: false,
  [FORM_NAMES.children]: false,
  [FORM_NAMES.type]: false,
  [FORM_NAMES.price]: false,
  [FORM_NAMES.occupied_rooms]: false,
  [FORM_NAMES.external_room_id]: false,
  [FORM_NAMES.external_room_id_option]: false,
  [FORM_NAMES.deposit]: false,
};

function getStatDisplayFields(housing?: ExtendedHousing) {
  const isSTATEnabled = housing?.stat_account && housing?.is_stat_registration_enabled;
  const statType = getStatType(housing);
  let fields = {};

  if (isSTATEnabled) {
    if (!STAT_TYPES_WITHOUT_OCCUPIED_ROOMS.includes(statType)) {
      fields = {
        ...fields,
        [FORM_NAMES.occupied_rooms]: true,
      };
    }

    if (statType === STAT_TYPES.toscanaRicestat) {
      fields = {
        ...fields,
        [FORM_NAMES.space]: false,
        [FORM_NAMES.external_room_id_option]: true,
      };
    }
  }

  return fields;
}

function getContractsDisplayFields(housing?: ExtendedHousing) {
  const isContractEnabled = housing?.is_contract_enabled;
  const countryCode = getCountryCode(housing);

  if (isContractEnabled) {
    if (countryCode === COUNTRY_CODES.italy) {
      return {
        [FORM_NAMES.price]: false,
        [FORM_NAMES.deposit]: false,
      };
    }
    return {
      [FORM_NAMES.price]: false,
    };
  }
  return {};
}

function getDisplayFields(
  housing?: ExtendedHousing,
  collaboratorsOptions?: SelectOption[],
) {
  const country = getCountryCode(housing);
  const isSpaceVisible = Boolean(housing?.rooms.length);
  const isResponsibleVisible = Boolean(
    collaboratorsOptions && collaboratorsOptions.length > 1,
  );
  const fields = {
    ...INIT_DISPLAY_FIELDS,
    ...getStatDisplayFields(housing),
    ...getContractsDisplayFields(housing),
    [FORM_NAMES.space]: isSpaceVisible,
    [FORM_NAMES.responsible]: isResponsibleVisible,
  };

  switch (country) {
    case COUNTRY_CODES.uae:
    case COUNTRY_CODES.italy:
    case COUNTRY_CODES.austria: {
      return {
        ...fields,
        [FORM_NAMES.type]: true,
      };
    }
    default: {
      return fields;
    }
  }
}

function getFields(housing?: ExtendedHousing, collaboratorsOption?: SelectOption[]) {
  const display = getDisplayFields(housing, collaboratorsOption);
  const required = getRequiredFields(housing);

  return {display, required};
}

function fetchIsHousingAvailable(id: string, params = '') {
  return queryFetcher(api.housings.ENDPOINTS.one(id, params));
}

type LocationState = {
  formData?: FormTypes;
};

type ReservationInfoSectionProps = {
  disabled: boolean;
  onExtendedSelectedHousingChange: React.Dispatch<
    React.SetStateAction<ExtendedHousing | undefined>
  >;
  isEditing?: boolean;
  setIsSectionTouched?: (isTouched: boolean) => void;
  reservation?: LightReservation;
  reservationExtendedHousing?: ExtendedHousing;
  hasDepositExemption?: boolean;
};

const defaultProps: Partial<ReservationInfoSectionProps> = {
  disabled: false,
  isEditing: false,
  reservation: undefined,
};

function ReservationInfoSection({
  disabled,
  reservation,
  isEditing,
  setIsSectionTouched,
  onExtendedSelectedHousingChange,
  reservationExtendedHousing,
  hasDepositExemption,
}: ReservationInfoSectionProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {
    control,
    register,
    watch,
    trigger,
    formState,
    setValue,
    reset,
    unregister,
  } = useFormContext<FormTypes>();

  const {errors} = formState;

  const location = useLocation<LocationState>();
  const persistedFormData = location.state?.formData;

  const [groupTypes, setGroupTypes] = React.useState<SelectOption[]>(
    ALL_GROUP_TYPES_OPTIONS,
  );
  const [isHousingPreloaded, setIsHousingPreloaded] = React.useState(false);
  const [isRoomPreloaded, setIsRoomPreloaded] = React.useState(false);
  const [focusedDateInput, setFocusedDateInput] = React.useState<
    'startDate' | 'endDate' | null
  >(null);
  const [minCheckInDate, setMinCheckInDate] = React.useState<Moment | null>(null);
  const [
    isPersistedFormStatePreloaded,
    setIsPersistedFormStatePreloaded,
  ] = React.useState(false);
  const [selectedHousing, setSelectedHousing] = React.useState<SelectOption>();

  const selectedHousingId = selectedHousing?.value;
  const {data: extendedSelectedHousing, status: extendedSelectedHousingStatus} = useQuery<
    ExtendedHousing
  >(
    ['extendedHousing', selectedHousingId!, EXTENDED_HOUSING_FIELD_SET],
    () =>
      api.housings.fetchOne(selectedHousingId!.toString(), EXTENDED_HOUSING_FIELD_SET),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        onExtendedSelectedHousingChange(data);
      },
      enabled: Boolean(selectedHousingId),
    },
  );

  const isLoadingExtendedHousing = extendedSelectedHousingStatus === 'loading';

  const [fields, setFields] = React.useState(() => {
    return getFields(extendedSelectedHousing, []);
  });

  const spacesOptions = React.useMemo(() => {
    return getSpacesAsOptions(extendedSelectedHousing);
  }, [extendedSelectedHousing]);

  const guestGroupId = reservation?.guest_group_id;
  const {data: guestGroup} = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
  });

  const {data: collaborators, error: collaboratorsError} = useQuery(
    'collaborators',
    fetchCollaborators,
  );
  useErrorToast(collaboratorsError, {
    notFoundMessage:
      'Requested collaborators could not be found. Please contact support.',
  });

  const {data: rooms, error: roomsError} = useQuery('rooms', fetchRooms);
  useErrorToast(roomsError, {
    notFoundMessage: 'Requested rooms could not be found. Please contact support.',
  });
  const roomsOptions = React.useMemo(() => {
    return getRoomsAsOptions(rooms, selectedHousingId?.toString());
  }, [rooms, selectedHousingId]);

  const housingCountry = getCountryCode(extendedSelectedHousing);
  const numberOfGuests = watch(FORM_NAMES.number_of_guests);
  const children = watch(FORM_NAMES.children);
  const typeOfRegistration = watch(FORM_NAMES.type)?.value;

  const {isFormTouched, setUntouchedValues} = useIsFormTouched({
    displayFields: fields.display,
    watch,
    defaultValues: {
      [FORM_NAMES.housing]: '',
      [FORM_NAMES.space]: '',
      [FORM_NAMES.responsible]: RESPONSIBLE_ME_OPTION,
      [FORM_NAMES.check_in_date]: '',
      [FORM_NAMES.check_out_date]: '',
      [FORM_NAMES.number_of_guests]: '',
      [FORM_NAMES.guest_leader_name]: '',
      [FORM_NAMES.default_phone_number]: '',
      [FORM_NAMES.number_of_nights]: '',
      [FORM_NAMES.children]: '',
      [FORM_NAMES.type]: '',
      [FORM_NAMES.price]: '',
      [FORM_NAMES.occupied_rooms]: '',
      [FORM_NAMES.external_room_id]: '',
      [FORM_NAMES.external_room_id_option]: '',
      [FORM_NAMES.deposit]: '',
      [FORM_NAMES.source_name]: '',
      [FORM_NAMES.booking_reference]: '',
    },
  });

  const availableHousingsCheckInDate = getAvailableHousingsCheckInDate(
    watch(FORM_NAMES.check_in_date),
    reservation,
  );
  const numberOfNights = watch(FORM_NAMES.number_of_nights) || '';

  useQuery<{id: string}>(
    ['availableHousing', selectedHousingId!, `available=1&field_set=id`],
    ({queryKey}) => fetchIsHousingAvailable(selectedHousingId!.toString(), queryKey[2]),
    {
      enabled: Boolean(isEditing && selectedHousingId),
      refetchOnWindowFocus: false,
      onSuccess: function validateHousingSelection(data) {
        const isSelectedHousingCanBeSelected = Boolean(data?.id);

        if (!isSelectedHousingCanBeSelected) {
          setValue(FORM_NAMES.housing, undefined);
        }
      },
    },
  );

  const {data: reservationSources, error: reservationSourcesError} = useQuery<
    ReservationSource[]
  >('reservationSources', () => api.reservationSources.fetchReservationSources(), {
    refetchOnWindowFocus: false,
  });
  useErrorToast(reservationSourcesError, {
    notFoundMessage:
      'Requested reservation sources could not be found. Please contact support',
  });

  const collaboratorsOptions = React.useMemo(() => {
    return getCollaboratorsAsOptions(collaborators);
  }, [collaborators]);
  const reservationSourcesOptions = React.useMemo(() => {
    return getReservationSourcesAsOptions(reservationSources);
  }, [reservationSources]);

  React.useEffect(
    function restartHousingsQueryOnExtraParamsChange() {
      if (availableHousingsCheckInDate || numberOfNights) {
        queryClient.resetQueries('paginatedHousings');
      }
    },
    [availableHousingsCheckInDate, numberOfNights, queryClient],
  );

  React.useEffect(
    function updateFields() {
      const nextFields = getFields(extendedSelectedHousing, collaboratorsOptions);
      setFields(nextFields);
    },
    [extendedSelectedHousing, collaboratorsOptions],
  );

  React.useEffect(() => {
    if (typeof setIsSectionTouched === 'function') {
      setIsSectionTouched(isFormTouched);
    }
  }, [isFormTouched, setIsSectionTouched]);

  const checkInDisplayField = fields.display[FORM_NAMES.check_in_date];
  const checkInRequiredField = fields.required[FORM_NAMES.check_in_date];
  const checkOutDisplayField = fields.display[FORM_NAMES.check_out_date];
  const checkOutRequiredField = fields.required[FORM_NAMES.check_out_date];
  React.useEffect(
    function registerDates() {
      if (checkInDisplayField && checkOutDisplayField) {
        register(FORM_NAMES.check_in_date, {
          required: checkInRequiredField,
        });
        register(FORM_NAMES.check_out_date, {
          required: checkOutRequiredField,
        });
      } else {
        unregister([FORM_NAMES.check_in_date]);
        unregister([FORM_NAMES.check_out_date]);
      }
    },
    [
      register,
      checkInRequiredField,
      checkOutRequiredField,
      checkOutDisplayField,
      checkInDisplayField,
      unregister,
    ],
  );

  React.useEffect(
    function resetSpaceOnSelectedHousingChange() {
      setValue(FORM_NAMES.space, undefined);
    },
    [selectedHousing, setValue],
  );

  React.useEffect(
    function setHousingMinCheckInDate() {
      const minCheckInDate = getMinCheckInDate(housingCountry);
      setMinCheckInDate(minCheckInDate);
    },
    [housingCountry],
  );

  React.useEffect(
    function preloadPersistedFormData() {
      const canPreloadOneTime =
        persistedFormData &&
        reservation &&
        !reservation?.manuallyUpdated &&
        !isPersistedFormStatePreloaded;

      if (canPreloadOneTime) {
        const checkInDate = persistedFormData![FORM_NAMES.check_in_date]
          ? moment(persistedFormData![FORM_NAMES.check_in_date])
          : undefined;

        const checkOutDate = persistedFormData![FORM_NAMES.check_out_date]
          ? moment(persistedFormData![FORM_NAMES.check_out_date])
          : undefined;
        reset({
          ...persistedFormData,
          [FORM_NAMES.check_in_date]: checkInDate,
          [FORM_NAMES.check_out_date]: checkOutDate,
        });

        setIsPersistedFormStatePreloaded(true);
      }
    },
    [reset, persistedFormData, reservation, isPersistedFormStatePreloaded],
  );

  React.useEffect(
    function preloadHousing() {
      if (!reservationExtendedHousing || isHousingPreloaded) {
        return;
      }

      const nextHousing = {
        label: reservationExtendedHousing.name,
        value: reservationExtendedHousing.id,
      };

      if (nextHousing) {
        if (!persistedFormData && !reservation?.manuallyUpdated) {
          setIsHousingPreloaded(true);
          setSelectedHousing(nextHousing);
          setValue(FORM_NAMES.housing, nextHousing);
        }

        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.housing]: nextHousing,
          };
        });
      }
    },
    [
      reservation,
      setValue,
      isHousingPreloaded,
      persistedFormData,
      setUntouchedValues,
      reservationExtendedHousing,
      setSelectedHousing,
    ],
  );

  React.useEffect(
    function preloadSpace() {
      if (persistedFormData || reservation?.manuallyUpdated) {
        return;
      }
      if (
        !spacesOptions.length ||
        isRoomPreloaded ||
        !reservation?.room_id ||
        !fields.display[FORM_NAMES.space]
      ) {
        return;
      }
      const nextRoom = spacesOptions.find((r) => {
        return r.value === reservation?.room_id;
      });
      if (nextRoom) {
        setIsRoomPreloaded(true);
        setValue(FORM_NAMES.space, nextRoom);

        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.space]: nextRoom,
          };
        });
      }
    },
    [
      reservation,
      spacesOptions,
      setValue,
      isRoomPreloaded,
      persistedFormData,
      fields,
      setUntouchedValues,
    ],
  );

  React.useEffect(
    function preloadData() {
      if (!reservation) {
        return;
      }

      const checkInDate = reservation?.check_in_date
        ? moment(formatDate(reservation?.check_in_date, 'yyyy-MM-dd'))
        : undefined;
      const checkOutDate = reservation?.check_out_date
        ? moment(formatDate(reservation.check_out_date, 'yyyy-MM-dd'))
        : undefined;
      const groupType = guestGroup?.type
        ? [...ALL_GROUP_TYPES_OPTIONS, TOURIST_GROUP_GROUP_TYPE_OPTION].find(
            (t) => t.value === guestGroup?.type,
          )
        : undefined;

      const formData = [
        {name: FORM_NAMES.check_in_date, value: checkInDate},
        {name: FORM_NAMES.check_out_date, value: checkOutDate},
        {name: FORM_NAMES.type, value: groupType},
        {
          name: FORM_NAMES.deposit,
          value: reservation?.deposit ? String(reservation?.deposit) : '',
        },
        {
          name: FORM_NAMES.number_of_guests,
          value: guestGroup?.number_of_guests ? String(guestGroup?.number_of_guests) : '',
        },
        {
          name: FORM_NAMES.number_of_nights,
          value: reservation?.nights_of_stay ? String(reservation?.nights_of_stay) : '',
        },
        {
          name: FORM_NAMES.guest_leader_name,
          value: reservation?.default_leader_full_name,
        },
        {
          name: FORM_NAMES.occupied_rooms,
          value: reservation?.occupied_rooms_quantity
            ? String(reservation?.occupied_rooms_quantity)
            : '',
        },
        {
          name: FORM_NAMES.default_phone_number,
          value: reservation?.default_phone_number || '',
        },
        {
          name: FORM_NAMES.booking_reference,
          value: reservation?.booking_reference || '',
        },
      ];

      setUntouchedValues((prevState) => {
        let result: {[key: string]: any} = {};

        formData.forEach(({name, value}) => {
          result[name] = value;
        });

        return {
          ...prevState,
          ...result,
        };
      });

      if (!persistedFormData && !reservation?.manuallyUpdated) {
        formData.forEach(({name, value}) => {
          setValue(name, value);
        });
      }
    },
    [
      reservation,
      setValue,
      isHousingPreloaded,
      persistedFormData,
      guestGroup,
      setUntouchedValues,
    ],
  );

  const isPriceFieldVisible = fields.display[FORM_NAMES.price];
  React.useEffect(
    function preloadPrice() {
      const canPreload = isPriceFieldVisible && reservation?.price;

      if (canPreload) {
        const price = String(reservation?.price);

        setValue(FORM_NAMES.price, String(reservation?.price));
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.price]: price,
          };
        });
      }
    },
    [setValue, isPriceFieldVisible, reservation?.price, setUntouchedValues],
  );

  React.useEffect(
    function preloadResponsible() {
      if (
        !isHousingPreloaded ||
        !collaboratorsOptions.length ||
        persistedFormData ||
        reservation?.manuallyUpdated
      ) {
        return;
      }

      const responsible = collaboratorsOptions.find((c) => {
        return c.value === reservation?.assigned_to;
      });

      if (responsible) {
        setValue(FORM_NAMES.responsible, responsible);
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.responsible]: responsible,
          };
        });
      } else {
        setValue(FORM_NAMES.responsible, RESPONSIBLE_ME_OPTION);
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.responsible]: RESPONSIBLE_ME_OPTION,
          };
        });
      }
    },
    [
      isHousingPreloaded,
      collaboratorsOptions,
      reservation,
      setValue,
      persistedFormData,
      setUntouchedValues,
    ],
  );

  React.useEffect(
    function preloadRoomId() {
      if (
        !roomsOptions.length ||
        !isHousingPreloaded ||
        !reservation?.external_room_id ||
        persistedFormData ||
        reservation?.manuallyUpdated
      ) {
        return;
      }

      const roomId = roomsOptions.find((r) => {
        return r.value === reservation.external_room_id;
      });

      setValue(FORM_NAMES.external_room_id_option, roomId);
      setValue(FORM_NAMES.external_room_id, reservation.external_room_id);

      setUntouchedValues((prevState) => {
        return {
          ...prevState,
          [FORM_NAMES.external_room_id_option]: roomId,
          [FORM_NAMES.external_room_id]: reservation.external_room_id,
        };
      });
    },
    [
      isHousingPreloaded,
      reservation,
      roomsOptions,
      setValue,
      persistedFormData,
      setUntouchedValues,
    ],
  );

  React.useEffect(
    function revalidateCheckInDateOnCountryChange() {
      if (formState.isSubmitted) {
        trigger(FORM_NAMES.check_in_date);
      }
    },
    [trigger, housingCountry, formState.isSubmitted],
  );

  React.useEffect(
    function revalidateTypeOfRegistrationOnChange() {
      if (formState.isSubmitted) {
        trigger(FORM_NAMES.type);
      }
    },
    [formState.isSubmitted, trigger, typeOfRegistration],
  );

  React.useEffect(
    function updateGroupTypesOnNumberOfGuestsChange() {
      let defaultAllGroupTypes = [...ALL_GROUP_TYPES_OPTIONS];

      if (housingCountry === COUNTRY_CODES.austria) {
        defaultAllGroupTypes.push(TOURIST_GROUP_GROUP_TYPE_OPTION);
      }
      if (numberOfGuests === undefined || numberOfGuests === '') {
        setGroupTypes(defaultAllGroupTypes);
        return;
      }

      let totalGuests =
        children !== undefined
          ? Number(numberOfGuests) - Number(children)
          : Number(numberOfGuests);
      totalGuests = totalGuests < 0 ? 0 : totalGuests;

      if (totalGuests > 1) {
        if (housingCountry === COUNTRY_CODES.austria) {
          setGroupTypes([...GROUP_GROUP_TYPES_OPTIONS, TOURIST_GROUP_GROUP_TYPE_OPTION]);
        } else {
          setGroupTypes(GROUP_GROUP_TYPES_OPTIONS);
        }
        return;
      }

      if (totalGuests > 0) {
        setGroupTypes(SINGLE_GROUP_TYPES_OPTIONS);
      }
    },
    [numberOfGuests, children, housingCountry],
  );

  React.useEffect(
    function keepCorrectRegistrationType() {
      if (!typeOfRegistration || !groupTypes.length) {
        return;
      }

      const hasSelectedGroupTypeOption = groupTypes.find(
        (g) => g?.value === typeOfRegistration,
      );
      if (!hasSelectedGroupTypeOption) {
        setValue(FORM_NAMES.type, undefined);
      }
    },
    [typeOfRegistration, groupTypes, setValue, trigger],
  );

  React.useEffect(
    function preloadSourceName() {
      const sourceName = reservation?.source_name;

      if (!sourceName || !reservationSources?.length) {
        return;
      }

      if (sourceName) {
        const option = {
          value: sourceName,
          label: sourceName,
        };

        setValue(FORM_NAMES.source_name, option);
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.source_name]: option,
          };
        });
      }
    },
    [reservation, reservationSources, setUntouchedValues, setValue],
  );

  React.useEffect(
    function updateNumberOfGuests() {
      if (!guestGroup) return;

      const numberOfAddedGuests = guestGroup.number_of_guests || DEFAULT_NUMBER_OF_GUESTS;

      setValue(FORM_NAMES.number_of_guests, String(numberOfAddedGuests));
    },
    [guestGroup, setValue],
  );

  return (
    <Section title={t('booking_information')}>
      <RelativeWrapper>
        {isLoadingExtendedHousing && (
          <HousingLoaderWrapper
            label={t('loading_details')}
            labelPlacement={LABEL_PLACEMENT.left}
          />
        )}
        <FieldsGridLayout>
          {fields.display[FORM_NAMES.housing] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.housing}
                rules={{required: fields.required[FORM_NAMES.housing]}}
                render={({field: {onChange, ...field}, fieldState: {error}}) => {
                  return (
                    <QueriedInfiniteScrollSelect
                      fetcher={(key, page, number) =>
                        api.housings.fetchPaginatedList(
                          key,
                          page,
                          number,
                          isEditing
                            ? `check_in_date=${availableHousingsCheckInDate}&nights_of_stay=${numberOfNights}`
                            : '',
                        )
                      }
                      queryKey="paginatedHousings"
                      blockQuery={isEditing && !isHousingPreloaded}
                      label={getRequiredOrOptionalFieldLabel(
                        t('property'),
                        fields.required[FORM_NAMES.housing],
                      )}
                      placeholder={t('select_your_property')}
                      disabled={disabled}
                      onChange={(option: SelectOption) => {
                        setSelectedHousing(option);
                        return onChange(option);
                      }}
                      error={error?.message}
                      {...field}
                    />
                  );
                }}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.space] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.space}
                rules={{required: fields.required[FORM_NAMES.space]}}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('space'),
                        fields.required[FORM_NAMES.space],
                      )}
                      options={spacesOptions}
                      error={error?.message}
                      disabled={disabled}
                      placeholder={t('select_your_space')}
                      {...field}
                    />
                  );
                }}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.responsible] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.responsible}
                rules={{required: fields.required[FORM_NAMES.responsible]}}
                defaultValue={RESPONSIBLE_ME_OPTION}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('responsible'),
                        fields.required[FORM_NAMES.responsible],
                      )}
                      options={collaboratorsOptions}
                      error={error?.message}
                      disabled={disabled}
                      placeholder={t('select_your_responsible')}
                      {...field}
                    />
                  );
                }}
              />
            </div>
          )}
          {(fields.display[FORM_NAMES.check_in_date] ||
            fields.display[FORM_NAMES.check_out_date]) && (
            <div>
              <FormValueController name={FORM_NAMES.check_in_date} control={control}>
                {(isEmpty) => (
                  <DateRangePicker
                    empty={isEmpty}
                    startDate={watch(FORM_NAMES.check_in_date) || null}
                    startDateId="check-in-date"
                    endDate={watch(FORM_NAMES.check_out_date) || null}
                    endDateId="check-out-date"
                    focusedInput={focusedDateInput}
                    disabled={disabled}
                    isOutsideRange={(day) => {
                      return day.isBefore(minCheckInDate);
                    }}
                    label={t('check_in_check_out')}
                    error={
                      errors[FORM_NAMES.check_in_date]?.message ||
                      errors[FORM_NAMES.check_out_date]?.message
                    }
                    onFocusChange={(focusedInput) => setFocusedDateInput(focusedInput)}
                    onDatesChange={({startDate, endDate}) => {
                      if (startDate) {
                        setValue(FORM_NAMES.check_in_date, startDate);
                      }

                      if (endDate && moment(endDate).isBefore(minCheckInDate)) {
                        setValue(FORM_NAMES.check_out_date, null);
                      } else {
                        setValue(FORM_NAMES.check_out_date, endDate);
                      }

                      if (formState.isSubmitted) {
                        trigger([FORM_NAMES.check_in_date, FORM_NAMES.check_out_date]);
                      }
                    }}
                  />
                )}
              </FormValueController>
            </div>
          )}
          {fields.display[FORM_NAMES.number_of_nights] && (
            <div>
              <InputController
                {...register(FORM_NAMES.number_of_nights, {
                  required: fields.required[FORM_NAMES.number_of_nights],
                  min: {
                    value: MIN_NUMBER_OF_NIGHTS,
                    message: t('min_number_is', {number: MIN_NUMBER_OF_NIGHTS}),
                  },
                })}
                control={control}
                type="number"
                label={getRequiredOrOptionalFieldLabel(
                  t('number_of_nights'),
                  fields.required[FORM_NAMES.number_of_nights],
                )}
                inputMode="numeric"
                placeholder={t('enter_number')}
                error={errors[FORM_NAMES.number_of_nights]?.message}
                disabled={disabled}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.number_of_guests] && (
            <div>
              <InputController
                {...register(FORM_NAMES.number_of_guests, {
                  required: fields.required[FORM_NAMES.number_of_guests],
                  min: {
                    value: MIN_NUMBER_OF_GUESTS,
                    message: t('min_number_is', {number: MIN_NUMBER_OF_GUESTS}),
                  },
                  max: {
                    value: MAX_NUMBER_OF_GUESTS,
                    message: t('max_number_is', {number: MAX_NUMBER_OF_GUESTS}),
                  },
                })}
                control={control}
                type="number"
                inputMode="numeric"
                label={getRequiredOrOptionalFieldLabel(
                  t('guests_to_register'),
                  fields.required[FORM_NAMES.number_of_guests],
                )}
                placeholder={t('enter_number')}
                error={errors[FORM_NAMES.number_of_guests]?.message}
                disabled={disabled}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.deposit] && (
            <div>
              <InputController
                {...register(FORM_NAMES.deposit, {
                  required: fields.required[FORM_NAMES.deposit],
                  min: {
                    value: MIN_PRICE,
                    message: t('min_number_is', {number: MIN_PRICE}),
                  },
                })}
                control={control}
                type="number"
                label={getRequiredOrOptionalFieldLabel(
                  t('deposit'),
                  fields.required[FORM_NAMES.deposit],
                )}
                step="0.01"
                inputMode="decimal"
                placeholder={t('enter_number')}
                error={(errors[FORM_NAMES.deposit] as any)?.message}
                disabled={disabled}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.occupied_rooms] && (
            <div>
              <InputController
                {...register(FORM_NAMES.occupied_rooms, {
                  required: fields.required[FORM_NAMES.occupied_rooms],
                  min: {
                    value: MIN_OCCUPIED_ROOMS,
                    message: t('min_number_is', {number: MIN_OCCUPIED_ROOMS}),
                  },
                })}
                control={control}
                type="number"
                label={getRequiredOrOptionalFieldLabel(
                  t('occupied_rooms'),
                  fields.required[FORM_NAMES.occupied_rooms],
                )}
                inputMode="numeric"
                placeholder={t('enter_number')}
                error={(errors[FORM_NAMES.occupied_rooms] as any)?.message}
                disabled={disabled}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.type] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.type}
                rules={{
                  required: fields.required[FORM_NAMES.type],
                }}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('type_of_registration'),
                        fields.required[FORM_NAMES.type],
                      )}
                      options={groupTypes}
                      error={error?.message}
                      disabled={disabled}
                      placeholder={t('select_your_type_of_registration')}
                      {...field}
                    />
                  );
                }}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.external_room_id] && (
            <div>
              <InputController
                {...register(FORM_NAMES.external_room_id, {
                  required: fields.required[FORM_NAMES.external_room_id],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('room_id'),
                  fields.required[FORM_NAMES.external_room_id],
                )}
                placeholder={t('enter_number')}
                error={(errors[FORM_NAMES.external_room_id] as any)?.message}
                disabled={disabled}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.external_room_id_option] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.external_room_id_option}
                rules={{
                  required: fields.required[FORM_NAMES.external_room_id_option],
                }}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={getRequiredOrOptionalFieldLabel(
                        t('room_id'),
                        fields.required[FORM_NAMES.external_room_id_option],
                      )}
                      options={roomsOptions}
                      error={error?.message}
                      disabled={disabled}
                      placeholder={t('select_your_room')}
                      {...field}
                    />
                  );
                }}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.guest_leader_name] && (
            <div>
              <InputController
                {...register(FORM_NAMES.guest_leader_name, {
                  required: fields.required[FORM_NAMES.guest_leader_name],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('guest_leader_name'),
                  fields.required[FORM_NAMES.guest_leader_name],
                )}
                placeholder={t('enter_name')}
                error={errors[FORM_NAMES.guest_leader_name]?.message}
                disabled={disabled}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.default_phone_number] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.default_phone_number}
                rules={{
                  required: fields.required[FORM_NAMES.default_phone_number],
                }}
                render={({field, fieldState: {error}}) => (
                  <PhoneInput
                    label={getRequiredOrOptionalFieldLabel(
                      t('phone_number'),
                      fields.required[FORM_NAMES.default_phone_number],
                    )}
                    placeholder={t('enter_your_phone_number')}
                    defaultCode={reservation?.default_phone_number_details?.code}
                    defaultInputValue={reservation?.default_phone_number_details?.number}
                    error={error?.message}
                    disabled={disabled}
                    {...field}
                  />
                )}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.source_name] && (
            <div>
              <Controller
                control={control}
                name={FORM_NAMES.source_name}
                render={({field}) => {
                  return (
                    <CreatableSelect
                      {...field}
                      disabled={disabled}
                      label={getRequiredOrOptionalFieldLabel(
                        t('booking_source'),
                        fields.required[FORM_NAMES.source_name],
                      )}
                      placeholder={t('booking_source_placeholder')}
                      options={reservationSourcesOptions}
                    />
                  );
                }}
              />
            </div>
          )}
          {fields.display[FORM_NAMES.booking_reference] && (
            <div>
              <InputController
                {...register(FORM_NAMES.booking_reference, {
                  required: fields.required[FORM_NAMES.booking_reference],
                })}
                control={control}
                label={getRequiredOrOptionalFieldLabel(
                  t('booking_reference'),
                  fields.required[FORM_NAMES.booking_reference],
                )}
                placeholder={t('enter_reference_code')}
                error={errors[FORM_NAMES.booking_reference]?.message}
                disabled={disabled}
              />
            </div>
          )}
        </FieldsGridLayout>
      </RelativeWrapper>
    </Section>
  );
}

ReservationInfoSection.defaultProps = defaultProps;
export {ReservationInfoSection, EXTENDED_HOUSING_FIELD_SET};
