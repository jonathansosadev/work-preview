import React from 'react';
import {Controller, OnSubmit, useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import useSWR from 'swr';
import {Moment} from 'moment';
import {
  OFFER_CATEGORIES,
  OFFER_CONFIRMATION_TYPES,
  DEAL_STATUSES,
  getSummaryPrices,
} from '../../utils/upselling';
import {Offer, Supplier} from '../../utils/upselling/types';
import {Guest, SelectOptionType} from '../../utils/types';
import {
  useErrorModal,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../utils/hooks';
import {useReservation} from '../../context/reservation';
import {usePaymentSettings} from '../../hooks/usePaymentSettings';
import {getStoredGuestId, setStoredGuestId} from '../../utils/guests';
import api, {getURL} from '../../api';
import {useCartDeals, CartDeal} from '../OffersAndExperiencesScreen/useCartDeals';
import {CATEGORIES_WITH_ADDRESS} from '../OfferDetailsScreen';
import OfferAvailability from './OfferAvailability';
import EmailRequestModal from './EmailRequestModal';
import PayingGuestSelectionModal from './PayingGuestSelectionModal';
import {
  Address,
  ContentWrapper,
  Form,
  NumberOfPeopleInput,
  Price,
  RequestButton,
  RequestSecondaryButton,
  StyledSingleDatePicker,
  StyledSpinnerButtons,
  Text,
  TimeSelect,
  Title,
  ViewMapLink,
} from './styled';

const googleMapsSearchUrl = 'https://www.google.com/maps/search/?api=1';
const categoriesWithNumberOfPeople = [OFFER_CATEGORIES.transportation];
const categoriesWithDateTimePickers = [OFFER_CATEGORIES.transportation];
const categoriesWithQuantity = [OFFER_CATEGORIES.other];
const minNumberOfPeople = 1;
const defaultQuantity = 1;

function buildTimeOptions() {
  const timeOptions: {value: string; label: string}[] = [];

  let hours = 0;
  let minutes = 0;

  for (let i = 0; i < 24 * (60 / 15); i++) {
    const result = `${hours >= 10 ? hours : `0${hours}`}:${
      minutes >= 10 ? minutes : `0${minutes}`
    }`;
    timeOptions.push({value: result, label: result});

    if (minutes === 45 && hours !== 24) {
      hours += 1;
      minutes = 0;
    } else {
      minutes += 15;
    }
  }

  return timeOptions;
}
const timeOptions = buildTimeOptions();
const defaultTimeOption = timeOptions[0];

enum BookingTargets {
  request,
  keepExploring,
  payNow,
}

enum FormNames {
  numberOfPeople = 'number_of_people',
  quantity = 'quantity',
  time = 'time',
  date = 'date',
}

type FormTypes = {
  [FormNames.numberOfPeople]: string;
  [FormNames.quantity]: string;
  [FormNames.time]: SelectOptionType;
  [FormNames.date]: Moment;
};

type BookOfferFormProps = {
  offer: Offer;
  supplier: Supplier | undefined;
  onBookAndKeepExploringSuccess: () => void;
  onRequestOfferSuccess: () => void;
};

function BookOfferForm({
  offer,
  supplier,
  onBookAndKeepExploringSuccess,
  onRequestOfferSuccess,
}: BookOfferFormProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {data: reservation} = useReservation();
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    getValues,
    control,
    formState: {isSubmitted},
  } = useForm<FormTypes>();
  const {
    isOpen: isEmailRequestModalOpen,
    openModal: openEmailRequestModal,
    closeModal: closeEmailRequestModal,
  } = useModalControls();
  const {
    isOpen: isPayingGuestSelectionModalOpen,
    openModal: openPayingGuestSelectionModal,
    closeModal: closePayingGuestSelectionModal,
  } = useModalControls();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading: isCreatingDeal, setStatus: setDealCreationStatus} = useStatus();
  const [isDateFocused, setIsDateFocused] = React.useState(false);
  const [offerPrice, setOfferPrice] = React.useState(getSummaryPrices(offer));
  const [bookingTarget, setBookingTarget] = React.useState(BookingTargets.request);
  const payingGuestIdRef = React.useRef<Guest | null>(null);
  const enterGuestMailRef = React.useRef<string | null>(null);

  const {
    isCreatingCartDeals,
    setCartDealToStorage,
    createCartDeals,
    goNextAfterUpselling,
  } = useCartDeals({
    onError: displayError,
  });

  const guestId = getStoredGuestId() || payingGuestIdRef.current?.id;
  const {data: guest, isValidating: isLoadingGuestId, mutate: mutateGuest} = useSWR(
    guestId ? getURL(api.guests.ENDPOINTS.one(guestId)) : null,
    {
      onError: error => {
        if (!isMounted.current) {
          return;
        }

        if (isPayingGuestSelectionModalOpen) {
          displayError(error);
          closePayingGuestSelectionModal();
        }

        setStoredGuestId('');
      },
    },
  );
  const isLoading = (!guest && isLoadingGuestId) || isCreatingDeal || isCreatingCartDeals;

  const getGoogleMapsSearchUrl = (address: string) => {
    const encodedQuery = encodeURIComponent(address);
    return `${googleMapsSearchUrl}&query=${encodedQuery}`;
  };

  const getFormFieldValueAsNumber = (name: FormNames) => {
    const numberOfPeople = parseInt(getValues()[name] as string, 10);
    const fallbackNumberOfPeople = 0;
    return isNaN(numberOfPeople) ? fallbackNumberOfPeople : numberOfPeople;
  };

  const incrementFormField = (name: FormNames) => {
    const numberOfPeople = getFormFieldValueAsNumber(name);
    const newValue = numberOfPeople + 1;
    setValue(name, String(newValue), isSubmitted);
    return newValue;
  };

  const decrementFormField = (name: FormNames) => {
    const numberOfPeople = getFormFieldValueAsNumber(name);
    const newValue = numberOfPeople - 1;
    setValue(name, String(newValue), isSubmitted);
    return newValue;
  };

  const buildDealPayload = (data: FormTypes): CartDeal => {
    const quantity = data[FormNames.quantity]
      ? Number(data[FormNames.quantity])
      : defaultQuantity;
    const numberOfPeople = data[FormNames.numberOfPeople]
      ? Number(data[FormNames.numberOfPeople])
      : undefined;
    const requestedDate = data[FormNames.date]
      ? data[FormNames.date].format('YYYY-MM-DD')
      : undefined;
    const requestedTime = data[FormNames.time]?.value as string;
    const requestedFor =
      requestedDate && requestedTime ? `${requestedDate}T${requestedTime}` : undefined;
    const guestId = guest?.id || payingGuestIdRef.current?.id;
    const guestName = guest?.full_name || payingGuestIdRef.current?.full_name;
    const guestEmail =
      guest?.email || enterGuestMailRef.current || payingGuestIdRef.current?.email;
    const status =
      offer.confirmation_type === OFFER_CONFIRMATION_TYPES.manual
        ? DEAL_STATUSES.requested
        : DEAL_STATUSES.approved;
    const requestedItems = offer.items.map(price => ({
      item: price.id,
      quantity: 1,
    }));

    return {
      quantity,
      status,
      core_guest_id: guestId,
      core_guest_name: guestName,
      guest_email: guestEmail,
      core_housing_id: reservation?.housing?.id,
      core_housing_name: reservation?.housing?.name,
      core_reservation_id: reservation?.id,
      offer_id: offer.id,
      requested_for: requestedFor,
      number_of_people: numberOfPeople,
      offerName: offer.title,
      requested_items: requestedItems,
    };
  };

  const createDeal = async (formData: FormTypes) => {
    const payload = buildDealPayload(formData);

    setDealCreationStatus('loading');
    const {error} = await api.upselling.createDeal(payload);
    setDealCreationStatus('idle');

    if (!isMounted.current) {
      return true;
    }

    if (error) {
      displayError(error);
      return Boolean(error);
    }
  };

  const bookOfferAndKeepExploring = (data: FormTypes) => {
    const deal = buildDealPayload(data);
    setCartDealToStorage(deal);
    onBookAndKeepExploringSuccess();
  };

  const handlePayNow = async (data: FormTypes) => {
    const deal = buildDealPayload(data);
    setCartDealToStorage(deal);

    const isError = await createCartDeals();
    if (!isError) {
      goNextAfterUpselling(true);
    }
  };

  const requestOffer = async (data: FormTypes) => {
    const isMissingGuestEmail =
      !isEmailRequestModalOpen &&
      offer.confirmation_type === OFFER_CONFIRMATION_TYPES.manual &&
      !guest?.email &&
      !payingGuestIdRef.current?.email;

    if (isMissingGuestEmail) {
      openEmailRequestModal();
      return;
    }

    const isError = await createDeal(data);
    if (!isError) {
      onRequestOfferSuccess();
    }
  };

  const submitWithRequiredInfoModals = (submitHandler: OnSubmit<FormTypes>) => {
    return (data: FormTypes) => {
      const storedGuestId = getStoredGuestId();
      if (!storedGuestId) {
        openPayingGuestSelectionModal();
        return;
      }

      return submitHandler(data);
    };
  };

  const saveAndPersistGuestToStorage = (guest: Guest) => {
    setStoredGuestId(guest.id);
    payingGuestIdRef.current = guest;
  };

  const selectActiveGuestAndSubmit = async (payingGuest: Guest) => {
    saveAndPersistGuestToStorage(payingGuest);
    closePayingGuestSelectionModal();

    if (bookingTarget === BookingTargets.request) {
      handleSubmit(submitWithRequiredInfoModals(requestOffer))();
    }
    if (bookingTarget === BookingTargets.keepExploring) {
      handleSubmit(submitWithRequiredInfoModals(bookOfferAndKeepExploring))();
    }
    if (bookingTarget === BookingTargets.payNow) {
      handleSubmit(submitWithRequiredInfoModals(handlePayNow))();
    }
  };

  const handlePeopleIncrement = () => {
    const newValue = incrementFormField(FormNames.numberOfPeople);
    const newSum = getSummaryPrices(offer) * newValue;
    setOfferPrice(newSum);
  };

  const handlePeopleDecrement = () => {
    const newValue = decrementFormField(FormNames.numberOfPeople);
    const newSum = getSummaryPrices(offer) * newValue;
    setOfferPrice(newSum);
  };

  const offerCategory = offer.category;
  const hasNumberOfPeople = categoriesWithNumberOfPeople.includes(offerCategory);
  const hasDateTimePickers = categoriesWithDateTimePickers.includes(offerCategory);
  const hasQuantity = categoriesWithQuantity.includes(offerCategory);
  const canHaveAddress = CATEGORIES_WITH_ADDRESS.includes(offerCategory);
  const supplierAddress = canHaveAddress && supplier?.address;

  return (
    <>
      <ErrorModal />
      {isPayingGuestSelectionModalOpen && (
        <PayingGuestSelectionModal
          loading={isLoadingGuestId}
          onClose={closePayingGuestSelectionModal}
          onSelect={selectActiveGuestAndSubmit}
        />
      )}
      {isEmailRequestModalOpen && guest?.id && (
        <EmailRequestModal
          guestId={guest.id}
          mutateGuest={mutateGuest}
          onClose={closeEmailRequestModal}
          enterGuestMailRef={enterGuestMailRef}
          onSuccess={handleSubmit(submitWithRequiredInfoModals(requestOffer))}
        />
      )}
      <Form onSubmit={e => e.preventDefault()}>
        {supplierAddress && (
          <Address>
            <ViewMapLink href={getGoogleMapsSearchUrl(supplierAddress)} target="_blank">
              {t('view_map')}
            </ViewMapLink>
            <Title>{t('address')}</Title>
            <Text>{supplierAddress}</Text>
          </Address>
        )}
        <OfferAvailability availability={offer.availability} />
        {hasDateTimePickers && (
          <>
            <Title>{t('enter_date_and_time')}</Title>
            <ContentWrapper>
              <Controller
                control={control}
                name={FormNames.date}
                onChangeName="onDateChange"
                valueName="date"
                as={
                  <StyledSingleDatePicker
                    date={undefined as any}
                    onDateChange={undefined as any}
                    label={t('date')}
                    focused={isDateFocused}
                    onFocusChange={({focused}) => setIsDateFocused(focused)}
                    id="dealDate"
                    error={(errors[FormNames.date] as any)?.message}
                  />
                }
                rules={{required: t('required') as string}}
              />
              <Controller
                control={control}
                name={FormNames.time}
                defaultValue={defaultTimeOption}
                rules={{required: t('required') as string}}
                as={
                  <TimeSelect
                    label={t('time')}
                    options={timeOptions}
                    error={(errors[FormNames.time] as any)?.message}
                  />
                }
              />
            </ContentWrapper>
          </>
        )}
        {hasNumberOfPeople && (
          <ContentWrapper>
            <NumberOfPeopleInput
              hideNumberButtons
              type="number"
              inputMode="numeric"
              name={FormNames.numberOfPeople}
              error={errors[FormNames.numberOfPeople]?.message}
              label={t('people')}
              defaultValue={minNumberOfPeople}
              ref={register({
                required: t('required') as string,
                min: {
                  value: minNumberOfPeople,
                  message: t('min_number_is', {number: minNumberOfPeople}),
                },
              })}
            />
            <StyledSpinnerButtons
              onIncrement={handlePeopleIncrement}
              onDecrement={handlePeopleDecrement}
            />
          </ContentWrapper>
        )}
        {hasQuantity && (
          <ContentWrapper>
            <NumberOfPeopleInput
              hideNumberButtons
              type="number"
              inputMode="numeric"
              name={FormNames.quantity}
              error={errors[FormNames.quantity]?.message}
              label={t('quantity')}
              defaultValue={minNumberOfPeople}
              ref={register({
                required: t('required') as string,
                min: {
                  value: minNumberOfPeople,
                  message: t('min_number_is', {number: minNumberOfPeople}),
                },
              })}
            />
            <StyledSpinnerButtons
              onIncrement={() => incrementFormField(FormNames.quantity)}
              onDecrement={() => decrementFormField(FormNames.quantity)}
            />
          </ContentWrapper>
        )}
        <Title>{t('price')}</Title>
        <Price>
          {offerPrice} {paymentSettingsCurrencyLabel}
        </Price>
        <RequestButton
          disabled={isLoading}
          onClick={e => {
            if (offer.confirmation_type === OFFER_CONFIRMATION_TYPES.manual) {
              setBookingTarget(BookingTargets.request);
              handleSubmit(submitWithRequiredInfoModals(requestOffer))(e);
            } else {
              setBookingTarget(BookingTargets.payNow);
              handleSubmit(submitWithRequiredInfoModals(handlePayNow))(e);
            }
          }}
          label={
            offer.confirmation_type === OFFER_CONFIRMATION_TYPES.manual
              ? t('request_this_deal')
              : t('pay_now')
          }
        />
        {offer.confirmation_type === OFFER_CONFIRMATION_TYPES.auto && (
          <RequestSecondaryButton
            secondary
            disabled={isLoading}
            label={t('book_and_keep_exploring')}
            onClick={e => {
              setBookingTarget(BookingTargets.keepExploring);
              handleSubmit(submitWithRequiredInfoModals(bookOfferAndKeepExploring))(e);
            }}
          />
        )}
      </Form>
    </>
  );
}

export {BookOfferForm};
