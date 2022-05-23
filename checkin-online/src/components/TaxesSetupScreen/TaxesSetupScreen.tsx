import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {useForm, useFieldArray} from 'react-hook-form';
import useSWR from 'swr';
import {PATHS} from '../../Routes';
import {useReservation} from '../../context/reservation';
import api, {getURL, ResolverTypes} from '../../api';
import {
  getHousingCountryCode,
  getNumberOfGuests,
  getProvinceCode,
  getSeasonsIds,
} from '../../utils/reservation';
import {
  useErrorModal,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../utils/hooks';
import {Season, SelectOptionType} from '../../utils/types';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {usePaymentSettings} from '../../hooks/usePaymentSettings';
import paymentsIcon from '../../assets/payments.svg';
import whatDocsImage from '../../assets/what-documents-icon.png';
import whatDocsImage2x from '../../assets/what-documents-icon@2x.png';
import likeIcon from '../../assets/like.svg';
import Header from '../Header';
import Button from '../Button';
import QuestionMarkButton from '../QuestionMarkButton';
import Modal from '../Modal';
import GuestTaxInfo from '../GuestTaxInfo';
import {COUNTRY_CODES, NONE_EXEMPTION_OPTION} from '../../utils/constants';
import {DimensionsWrapper, ModalButton} from '../../styled/common';
import {ButtonsWrapper, GuestsList, TopText, TotalTaxes, TotalTaxesPrice} from './styled';

function fetchSeasonIfRequired(reservation: any = {}) {
  if (!reservation) {
    return null;
  }

  const highSeasonId = getSeasonsIds(reservation)[0];
  if (!highSeasonId) {
    return null;
  }

  return getURL(api.seasons.ENDPOINTS.one(highSeasonId));
}

type TaxExemptionType = {
  name: string;
  id: string;
  stat_type: string;
};
function getTaxExemptionsAsOptions(data: Array<TaxExemptionType>) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(t => {
    return {
      value: t.id,
      label: t.name,
    };
  });
}

export type FormTypes = {
  guests: {age: string; exemption: SelectOptionType}[];
};

type GuestsTaxes = {
  amount: number;
  calculate_only: boolean;
  guest_list: {age: number; total: number; exemption: string}[];
  id: string;
  reservation_id: string;
};

type LocationState = {
  formState?: FormTypes;
  guestsTaxes?: {[key: number]: number};
  wasPaymentSkipped?: boolean;
};

function TaxesSetupScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const isMounted = useIsMounted();
  const {
    openModal: openTaxesInfoModal,
    closeModal: closeTaxesInfoModal,
    isOpen: isTaxesInfoModalOpen,
  } = useModalControls();
  const {data: reservation, setReservation, refreshReservation} = useReservation();
  const {
    hasTaxes,
    isSomePayments,
    hasDeposits,
    hasUpselling,
    isLoadedAllReservationDetails,
  } = useComputedReservationDetails();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading, setStatus} = useStatus();
  const [guestsTaxes, setGuestsTaxes] = React.useState<{[key: number]: number}>(() => {
    return location?.state?.guestsTaxes || {};
  });
  const [loadingGuestsTaxes, setLoadingGuestsTaxes] = React.useState<{
    [key: number]: boolean;
  }>({});

  const {paymentSettingsCurrencyLabel} = usePaymentSettings();

  const {data: taxExemptions, isValidating: isLoadingTaxExemptions} = useSWR<
    TaxExemptionType[]
  >(getURL(api.statTaxExemptions.ENDPOINTS.get()));
  const {data: highSeason, isValidating: isLoadingSeason} = useSWR<Season>(
    fetchSeasonIfRequired(reservation),
  );
  const {arePaymentSettingsValid} = usePaymentSettings();

  const defaultFormValues = React.useMemo(() => {
    if (!reservation) {
      return [];
    }
    return Array.from(Array(getNumberOfGuests(reservation, 1))).map(() => {
      return {age: '', exemption: NONE_EXEMPTION_OPTION};
    });
  }, [reservation]);

  const persistedFormValues = location.state?.formState?.guests;
  const {register, control, handleSubmit, errors, getValues, setValue, reset} = useForm<
    FormTypes
  >({
    defaultValues: {
      guests: persistedFormValues || defaultFormValues,
    },
    mode: 'onChange',
  });
  const {fields} = useFieldArray({
    control,
    name: 'guests',
  });

  const goBack = React.useCallback(() => {
    history.push('/deals-list', location.state);
  }, [history, location.state]);

  React.useEffect(() => {
    const shouldRedirect =
      (isLoadedAllReservationDetails && !hasTaxes) || !arePaymentSettingsValid;

    if (shouldRedirect) {
      if (!arePaymentSettingsValid) {
        history.push('/finish');
        return;
      }

      if (isSomePayments) {
        history.push(PATHS.payments, location.state);
      } else if (hasDeposits) {
        history.push('/deposits/payment', location.state);
      } else {
        history.push('/finish');
      }
    }
  }, [
    arePaymentSettingsValid,
    hasDeposits,
    hasTaxes,
    history,
    isLoadedAllReservationDetails,
    isSomePayments,
    location.state,
  ]);

  React.useEffect(() => {
    const country = getHousingCountryCode(reservation);
    const province = getProvinceCode(reservation);
    const isDubaiCity = country === COUNTRY_CODES.uae && province === 'AE-DU';

    async function sendSeasonGuests() {
      setStatus('loading');
      const payload = {reservation_id: reservation?.id};
      api.seasonGuests.post(payload).then(() => refreshReservation());
      history.push(PATHS.payments, location.state);
    }

    if (isDubaiCity) {
      sendSeasonGuests();
    }
  }, [history, location.state, reservation, setStatus, refreshReservation]);

  React.useEffect(() => {
    if (!persistedFormValues) {
      reset({guests: defaultFormValues});
    }
  }, [reset, defaultFormValues, persistedFormValues]);

  const hasSeasonExemptions = Boolean(highSeason?.exemptions?.length);

  const isAnyGuestTaxesLoading = React.useMemo(() => {
    return Object.values(loadingGuestsTaxes).some(Boolean);
  }, [loadingGuestsTaxes]);

  const totalPrice = React.useMemo(() => {
    let price = 0;
    Object.values(guestsTaxes).forEach(tax => {
      price += tax;
    });

    return price;
  }, [guestsTaxes]);

  const availableTaxExemptionsOptions = React.useMemo(() => {
    if (!taxExemptions || !highSeason) {
      return [NONE_EXEMPTION_OPTION];
    }
    if (!hasSeasonExemptions) {
      return [NONE_EXEMPTION_OPTION];
    }

    const seasonExemptions = highSeason.exemptions;
    const availableExemptions = taxExemptions?.filter(exemption => {
      return seasonExemptions.find(
        seasonExemption => seasonExemption.exemption_type === exemption.id,
      );
    });

    return [NONE_EXEMPTION_OPTION, ...getTaxExemptionsAsOptions(availableExemptions)];
  }, [hasSeasonExemptions, highSeason, taxExemptions]);

  const fetchExistingGuestList = async () => {
    const {data, error} = await api.seasonGuests.get(`reservation_id=${reservation?.id}`);
    if (!isMounted.current) {
      return;
    }

    if (error) {
      displayError(error);
      return null;
    }

    return data;
  };

  const getTaxCalculationPayload = React.useCallback(
    (formData: FormTypes, calculateOnly = false) => {
      return {
        calculate_only: calculateOnly,
        reservation_id: reservation?.id,
        guest_list: formData.guests
          .filter(guest => guest?.age)
          .map(guest => {
            return {
              ...guest,
              exemption: guest.exemption?.value || NONE_EXEMPTION_OPTION.value,
            };
          }),
      };
    },
    [reservation],
  );

  const getMarkReservationAsPaidPayload = () => {
    return {
      have_taxes_been_paid: true,
    };
  };

  const markReservationAsPaid = async () => {
    const payload = getMarkReservationAsPaidPayload();
    const {data, error} = await api.reservations.patch(reservation?.id, payload);

    if (!isMounted.current) {
      return;
    }

    setStatus('idle');

    if (error) {
      displayError(error);
      return;
    }

    if (data) {
      setReservation((prevState: any) => {
        return {
          ...prevState,
          ...payload,
        };
      });
    }

    if (hasDeposits) {
      history.push('/deposits/payment');
      return;
    }

    return history.push('/finish');
  };

  const calculateAllGuestTax = React.useCallback(
    async (formData: FormTypes) => {
      const payload = getTaxCalculationPayload(formData, true);

      const {data, error} = await api.seasonGuests.post<GuestsTaxes>(payload);

      if (!isMounted.current) return;

      if (error) return displayError(error);

      return data;
    },
    [displayError, getTaxCalculationPayload, isMounted],
  );

  const handleCalculateTaxes = React.useCallback(async () => {
    const data = await calculateAllGuestTax(getValues({nest: true}));
    if (!isMounted.current || !data) return;

    const guestListWithoutExemptions = data?.guest_list?.filter(
      guest => guest.exemption === NONE_EXEMPTION_OPTION.value,
    );
    const total = Number(data?.amount) / Number(guestListWithoutExemptions?.length);

    data?.guest_list?.forEach((guest, index) => {
      const itemTotalName = `guestsTaxes.${index}.total`;
      const value = guest.exemption !== NONE_EXEMPTION_OPTION.value ? 0 : total || 0;
      setValue(itemTotalName, value);
      setGuestsTaxes(prevState => {
        return {
          ...prevState,
          [index]: value,
        };
      });
    });
  }, [calculateAllGuestTax, getValues, isMounted, setValue]);

  const calculateAndSetGuestTax = async (formData: FormTypes) => {
    setStatus('loading');

    const existingGuestList = await fetchExistingGuestList();
    if (existingGuestList === null) {
      setStatus('idle');
      return;
    }

    let result: ResolverTypes;
    const payload = getTaxCalculationPayload(formData);

    if (existingGuestList?.length) {
      result = await api.seasonGuests.patch(existingGuestList[0]?.id, payload);
    } else {
      result = await api.seasonGuests.post(payload);
    }

    if (!isMounted.current) {
      return;
    }

    if (result.error) {
      setStatus('idle');
      displayError(result.error);
      return;
    }

    if (result.data?.amount === 0) {
      markReservationAsPaid();
      return;
    }

    setStatus('idle');

    if (!result.data?.amount) {
      displayError(t('calced_price_not_found'));
      return;
    }

    if (result?.data?.amount !== Number(totalPrice.toFixed(2))) {
      displayError(t('calced_price_is_incorrect'));
      return;
    }

    refreshReservation();

    history.push(PATHS.payments, {
      taxAmount: result?.data?.amount,
      formState: formData,
      guestsTaxes,
      ...location.state,
    });
  };

  const onSubmit = (data: any) => {
    calculateAndSetGuestTax(data);
  };

  return (
    <div>
      <Header title={t('taxes')} hideBackButton={!hasUpselling} onBack={goBack} />
      <DimensionsWrapper>
        <TopText>
          {t('you_have_to_pay_taxes')}
          {` `}
          <QuestionMarkButton onClick={openTaxesInfoModal} />
        </TopText>
        <GuestsList>
          {fields.map((item, index) => {
            return (
              <GuestTaxInfo
                key={item.id}
                disabled={isLoadingSeason}
                getValues={getValues}
                availableTaxExemptions={availableTaxExemptionsOptions}
                control={control}
                displayError={displayError}
                errors={errors}
                guestsTaxes={guestsTaxes}
                hasSeasonExemptions={hasSeasonExemptions}
                index={index}
                isExemptionFieldLoading={isLoadingTaxExemptions}
                item={item}
                register={register}
                setGuestsTaxes={setGuestsTaxes}
                reservationId={reservation?.id}
                setLoadingGuestsTaxes={setLoadingGuestsTaxes}
                handleCalculateTaxes={handleCalculateTaxes}
                setValue={setValue}
              />
            );
          })}
        </GuestsList>
        <TotalTaxes>
          {t('total_taxes')}
          <TotalTaxesPrice>
            {totalPrice.toFixed(2)}
            {` `}
            {paymentSettingsCurrencyLabel}
          </TotalTaxesPrice>
        </TotalTaxes>
        <ButtonsWrapper>
          <div>
            <Button
              disabled={isLoading || isAnyGuestTaxesLoading}
              icon={<img src={paymentsIcon} alt="Payments" />}
              label={t('proceed_to_payment')}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
        </ButtonsWrapper>
      </DimensionsWrapper>
      <Modal
        closeOnEscape
        closeOnDocumentClick
        open={isTaxesInfoModalOpen}
        onClose={closeTaxesInfoModal}
        title={t('tourist_taxes_are_mandatory_in_countries')}
        text={
          <>
            {t('depending_on_country_you_pay_taxes')}
            <p />
            {t('taxes_may_vary')}
          </>
        }
        iconSrc={whatDocsImage}
        iconAlt="Thinking person"
        iconProps={{
          style: {
            width: 93,
            height: 84,
          },
          srcSet: `${whatDocsImage} 1x, ${whatDocsImage2x} 2x`,
        }}
      >
        <ModalButton
          label={t('ok')}
          onClick={closeTaxesInfoModal}
          icon={<img src={likeIcon} alt="Like" />}
        />
      </Modal>
      <ErrorModal />
    </div>
  );
}

export {TaxesSetupScreen};
