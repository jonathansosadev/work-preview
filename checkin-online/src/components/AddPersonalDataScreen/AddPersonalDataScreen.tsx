import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {FormContext, useForm} from 'react-hook-form';
import {getHeaderProps} from '../AddPersonalDataTypeScreen';
import {PATHS} from '../../Routes';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import Header from '../Header';
import AddPersonalDataForm from '../AddPersonalDataForm';
import {DimensionsWrapper} from '../../styled/common';

type LocationType = {
  areTermsAccepted?: boolean;
  wasPaymentSkipped?: boolean;
  fromHousingFlow?: boolean;
};

function AddPersonalDataScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationType>();
  const methods = useForm({
    submitFocusError: false,
  });
  const reservationDetails = useComputedReservationDetails();
  const [isBackButtonHidden, setIsBackButtonHidden] = React.useState(false);
  const [areTermsAccepted, setAreTermsAccepted] = React.useState(
    Boolean(location.state?.areTermsAccepted),
  );

  React.useEffect(
    function handleIsBackHidden() {
      setIsBackButtonHidden(Boolean(location.state?.fromHousingFlow));
    },
    [location],
  );

  React.useEffect(
    function handleIsExtraPaymentAdded() {
      if (reservationDetails.hasNewPayment && !location?.state?.wasPaymentSkipped) {
        history.push(PATHS.taxesSetup);
      }
    },
    [reservationDetails.hasNewPayment, history, location],
  );

  const getPersistedState = () => {
    if (!location.state) {
      return {
        highlightFormFields: false,
        formData: methods.getValues(),
      };
    }

    return {
      ...location.state,
      areTermsAccepted,
      highlightFormFields: false,
      formData: methods.getValues(),
    };
  };

  const goBack = () => {
    const persistedState = getPersistedState();
    const hasReservationBiomatch =
      reservationDetails.hasBiomatch && reservationDetails.isDocScanDisabled;

    if (hasReservationBiomatch) {
      if (reservationDetails.isAliceOnboardingEnabled) {
        history.push('/onboarding/form', persistedState);
      } else {
        history.push('/verification/result', persistedState);
      }

      return;
    }

    if (reservationDetails.hasGuestMembers || reservationDetails.isDocScanDisabled) {
      history.push('/', persistedState);
      return;
    }

    history.push('/form/type', persistedState);
  };

  return (
    <>
      <Header
        hideBackButton={isBackButtonHidden}
        title={t('add_personal_data')}
        onBack={goBack}
        {...getHeaderProps(reservationDetails)}
      />
      <DimensionsWrapper>
        <FormContext {...methods}>
          <AddPersonalDataForm
            setIsBackButtonHidden={setIsBackButtonHidden}
            setAreTermsAccepted={setAreTermsAccepted}
            areTermsAccepted={areTermsAccepted}
          />
        </FormContext>
      </DimensionsWrapper>
    </>
  );
}

export {AddPersonalDataScreen};
