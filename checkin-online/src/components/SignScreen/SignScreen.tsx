import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import docTypes from '../../utils/docTypes';
import api from '../../api';
import {useReservation} from '../../context/reservation';
import {
  ComputedReservationDetailsContextProps,
  useComputedReservationDetails,
} from '../../context/computedReservationDetails';
import {getHousingCountryCode, getIsContractEnabled} from '../../utils/reservation';
import {useErrorModal, useIsMounted} from '../../utils/hooks';
import {getFinishCheckinHistoryArgs} from '../../utils/checkin';
import {useRegisterGuest} from '../../hooks/useRegisterGuest';
import {COUNTRY_CODES_WITHOUT_SIGNATURE} from '../../utils/constants';
import {AliceReport} from '../AliceOnboardingForm/AliceOnboardingForm';
import envelopeIcon from '../../assets/view-contract-envelope.svg';
import signIcon from '../../assets/sign-icon.svg';
import termsIcon from '../../assets/terms-icon.svg';
import userIcon from '../../assets/user.svg';
import ReactSignatureCanvas from 'react-signature-canvas';
import Checkbox from '../Checkbox';
import Header from '../Header';
import SubmitButton from '../SubmitButton';
import Modal from '../Modal';
import Button from '../Button';
import {
  CheckboxWrapper,
  ModalButtonWrapper,
  RetryButton,
  SignModalButtonWrapper,
  StyledSignatureCanvas,
  SubmitButtonWrapper,
  TermsLink,
  Text,
  ViewContractIconContainer,
  ViewContractWrapper,
  Wrapper,
  AddYourSignatureText,
} from './styled';

export enum CHECKBOXES {
  terms = 'terms',
  contract = 'contract',
}

type CheckboxesType = {
  [key: string]: boolean;
};

function getHeaderProps({
  hasGuestMembers,
  hasBiomatchForGuestLeader,
  isContractEnabled,
  isThailandReservation,
  isDubaiReservation,
  reservation,
  isBiomatchForAllGuests,
  hasScanDocument,
}: ComputedReservationDetailsContextProps) {
  const countryCode = getHousingCountryCode(reservation);

  if (hasGuestMembers && isBiomatchForAllGuests) {
    if (hasScanDocument) {
      return {
        steps: 4,
        activeStep: 4,
      };
    }

    return {
      steps: 3,
      activeStep: 3,
    };
  }

  if (hasGuestMembers) {
    if (hasScanDocument) {
      return {
        steps: 3,
        activeStep: 3,
      };
    }

    return {
      steps: 2,
      activeStep: 2,
    };
  }

  if (isContractEnabled) {
    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (hasBiomatchForGuestLeader) {
        return {
          steps: 5,
          activeStep: 5,
        };
      }

      return {
        steps: 4,
        activeStep: 4,
      };
    }
  }

  if (
    !isContractEnabled &&
    COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) &&
    !isThailandReservation
  ) {
    if (hasBiomatchForGuestLeader) {
      if (hasScanDocument) {
        return {
          steps: 4,
          activeStep: 4,
        };
      }
    }

    if (hasScanDocument) {
      return {
        steps: 3,
        activeStep: 4,
      };
    }
  }

  if (hasBiomatchForGuestLeader) {
    if (hasScanDocument) {
      return {
        steps: 5,
        activeStep: 4,
      };
    }

    return {
      steps: 4,
      activeStep: 3,
    };
  }

  if (hasScanDocument) {
    return {
      steps: 4,
      activeStep: 4,
    };
  }

  return {
    steps: 3,
    activeStep: 3,
  };
}

type LocationTypes = {
  formData: any;
  number_of_guests?: number;
  children?: number;
  ocrWasUsed?: boolean;
  back_side_scan: string;
  front_side_scan?: string;
  aliceReport?: AliceReport;
  biomatch?: {
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
};

type ContractType = {
  file: string;
};

function SignScreen() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const signatureRef = React.useRef<ReactSignatureCanvas>(null);
  const history = useHistory();
  const registerGuest = useRegisterGuest();
  const location = useLocation<LocationTypes>();
  const {ErrorModal, displayError, closeErrorModal} = useErrorModal();
  const {data: reservation, refreshReservation, patchReservation} = useReservation();
  const {
    hasGuestMembers,
    isThailandReservation,
    isDubaiReservation,
    ...reservationDetails
  } = useComputedReservationDetails();
  const isContractEnabled = !hasGuestMembers && getIsContractEnabled(reservation);
  const [isLoadingContracts, setIsLoadingContracts] = React.useState(false);
  const [isContractsError, setIsContractsError] = React.useState(false);
  const [signature, setSignature] = React.useState<string | undefined>(undefined);
  const [isSignModalOpen, setIsSignModalOpen] = React.useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = React.useState(false);
  const [isSignatureEnabled, setIsSignatureEnabled] = React.useState(false);
  const [contracts, setContracts] = React.useState<Array<ContractType>>([]);
  const [checkboxes, setCheckboxes] = React.useState<CheckboxesType>({
    [CHECKBOXES.terms]: false,
    [CHECKBOXES.contract]: false,
  });

  const goBack = React.useCallback(() => {
    if (isDubaiReservation && !hasGuestMembers) {
      const wasIDScanned =
        location.state?.formData?.docType?.value === docTypes.identityCard().value;
      if (wasIDScanned) {
        history.push('/scan/back-side', location.state);
        return;
      }

      history.push('/scan/passport', location.state);
      return;
    }

    if (isThailandReservation && !hasGuestMembers) {
      history.push('/scan/doc', location.state);
      return;
    }

    history.push('/form/add', location.state);
  }, [
    hasGuestMembers,
    history,
    isDubaiReservation,
    isThailandReservation,
    location.state,
  ]);

  React.useEffect(() => {
    if (!location.state?.formData) {
      goBack();
    }
  }, [goBack, location.state]);

  const fetchContracts = React.useCallback(async () => {
    const reservationId = reservation?.id;
    if (!reservationId) {
      return;
    }
    setIsContractsError(false);
    setIsLoadingContracts(true);
    const {data, error} = await api.documents.getContracts(
      `housing_sample_id=${reservation?.housing?.id}`,
    );

    if (data) {
      setContracts(data);
    }
    if (error) {
      setIsContractsError(true);
    }
    setIsLoadingContracts(false);
  }, [reservation]);

  React.useEffect(() => {
    if (isContractEnabled) {
      fetchContracts();
    }
  }, [fetchContracts, isContractEnabled]);

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignature('');
  };

  const saveSignature = () => {
    const signature = signatureRef.current?.getCanvas()?.toDataURL();
    setSignature(signature);
  };

  const handleCheckboxChange = (name = '') => {
    if (!name) {
      return;
    }

    setCheckboxes(prevState => {
      return {
        ...prevState,
        [name]: !prevState[name],
      };
    });
  };

  const handleSignatureEnable = () => {
    setIsSignatureEnabled(true);
  };

  const handleSignModalClose = () => {
    setIsSignModalOpen(false);
    handleSignatureEnable();
  };

  const handleTermsModalClose = () => {
    setIsTermsModalOpen(false);
    setCheckboxes(prevState => {
      return {
        ...prevState,
        [CHECKBOXES.terms]: true,
        [CHECKBOXES.contract]: true,
      };
    });
  };

  const viewContract = () => {
    const contract = contracts[0];
    if (contract?.file) {
      window.open(contract?.file, '_blank');
    } else {
      displayError();
    }
  };

  const getReservationPayload = () => {
    if (hasGuestMembers) {
      return null;
    }

    if (location.state?.children) {
      const computedNumberOfGuests =
        Number(location.state?.number_of_guests) + Number(location.state.children);
      return {
        guest_group: {
          number_of_guests: computedNumberOfGuests > 0 ? computedNumberOfGuests : 0,
        },
      };
    }

    return {
      guest_group: {
        number_of_guests: location.state?.number_of_guests,
      },
    };
  };

  const updateReservation = () => {
    const payload = getReservationPayload();
    if (payload) {
      return patchReservation(payload);
    }

    return {
      error: null,
      data: null,
    };
  };

  const finishCheckin = (registeredGuestName: string) => {
    const {url, state} = getFinishCheckinHistoryArgs({
      reservationDetails: {
        hasGuestMembers,
        isThailandReservation,
        isDubaiReservation,
        ...reservationDetails,
      },
      locationState: {
        registeredGuestName,
      },
    });
    history.push(url, state);
  };

  const registerGuestAndUpdateReservation = async () => {
    closeErrorModal();
    setIsLoadingModalOpen(true);

    const {error: reservationError} = await updateReservation();

    if (!reservationError && isMounted.current) {
      const {error: guestError, data: guest} = await registerGuest({
        guestData: {
          signature,
        },
      });

      if (!guestError && isMounted.current) {
        const {error: refreshError} = await refreshReservation();

        if (!refreshError && isMounted.current) {
          setIsLoadingModalOpen(false);
          finishCheckin(guest.full_name);
        } else {
          displayError(refreshError);
        }
      } else {
        displayError(guestError);
      }
    } else {
      displayError(reservationError);
    }

    if (isMounted.current) {
      setIsLoadingModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    const shouldShowSignModal = !isSignatureEnabled || !signature;
    const shouldShowTermsModal = isContractEnabled
      ? !checkboxes[CHECKBOXES.terms] || !checkboxes[CHECKBOXES.contract]
      : !checkboxes[CHECKBOXES.terms];

    if (shouldShowSignModal) {
      setIsSignModalOpen(true);
      return;
    }

    if (shouldShowTermsModal) {
      setIsTermsModalOpen(true);
      return;
    }

    await registerGuestAndUpdateReservation();
  };

  return (
    <>
      <ErrorModal />
      <Modal
        open={isLoadingModalOpen}
        title={t('sending_your_data')}
        text={t('it_could_take_seconds')}
        iconSrc={userIcon}
        iconAlt="Person"
      />
      <Modal
        iconProps={{
          src: termsIcon,
          alt: '',
          height: 84,
          width: 84,
        }}
        open={isTermsModalOpen}
        onClose={handleTermsModalClose}
        title={
          isContractEnabled
            ? t('please_accept_contract_and_private_policy')
            : t('please_accept_the_privacy_policy')
        }
        text={
          isContractEnabled ? (
            <Trans i18nKey="authorities_mark_mandatory_to_accept_contract">
              In order to continue with the registration you must accept the
              <b>contract</b>
              and the
              <b>Privacy Policy</b>
            </Trans>
          ) : (
            <Trans i18nKey="authorities_mark_mandatory_to_accept">
              Authorities marks as mandatory to accept the
              <b>Privacy Policy</b>
            </Trans>
          )
        }
      >
        <ModalButtonWrapper>
          <Button
            label={
              isContractEnabled
                ? t('accept_the_privacy_policy_contract')
                : t('accept_the_privacy_policy')
            }
            onClick={handleTermsModalClose}
          />
        </ModalButtonWrapper>
      </Modal>
      <Modal
        open={isSignModalOpen}
        onClose={handleSignModalClose}
        title={t('you_have_to_sign')}
        iconProps={{
          src: signIcon,
          alt: '',
          height: 84,
          width: 84,
        }}
        text={
          isContractEnabled ? (
            <Trans i18nKey="please_sign_and_accept_privacy_policy_and_contract">
              Please <b>sign</b> inside the box. You can use your finger. Don't forget to
              {` `}
              <b>accept the contract and the Privacy Policy</b>
            </Trans>
          ) : (
            <Trans i18nKey="please_sign_and_accept_privacy_policy">
              Please <b>sign</b> inside the box. You can use your finger. Don't forget to
              {` `}
              <b>accept the Privacy Policy.</b>
            </Trans>
          )
        }
      >
        <SignModalButtonWrapper>
          <Button label={t('sign_now')} onClick={handleSignModalClose} />
        </SignModalButtonWrapper>
      </Modal>
      <Wrapper>
        <Header
          {...getHeaderProps({
            hasGuestMembers,
            isThailandReservation,
            isDubaiReservation,
            ...reservationDetails,
          })}
          hideBackButton={isLoadingModalOpen}
          title={t('sign')}
          onBack={goBack}
        />
        <AddYourSignatureText>{t('add_your_signature')}</AddYourSignatureText>
        {isContractsError && (
          <ViewContractWrapper>
            <Text>
              {t('contract_loading_error')}
              {` `}
              <RetryButton onClick={fetchContracts}>{t('try_again')}</RetryButton>
            </Text>
          </ViewContractWrapper>
        )}
        {isLoadingContracts && (
          <ViewContractWrapper>
            <Text>{t('loading_contract')}</Text>
          </ViewContractWrapper>
        )}
        {isContractEnabled && !isLoadingContracts && (
          <ViewContractWrapper data-testid="contract-btn" onClick={viewContract}>
            <ViewContractIconContainer>
              <img src={envelopeIcon} alt="Eye" />
            </ViewContractIconContainer>
            {t('view_contract')}
          </ViewContractWrapper>
        )}
        <StyledSignatureCanvas
          ref={signatureRef}
          onClear={clearSignature}
          onEnable={handleSignatureEnable}
          enabled={isSignatureEnabled}
          hasSignature={Boolean(signature)}
          onEnd={saveSignature}
        />
        {isContractEnabled && (
          <CheckboxWrapper>
            <Checkbox
              onChange={handleCheckboxChange}
              name={CHECKBOXES.contract}
              checked={checkboxes[CHECKBOXES.contract]}
              label={t('contract_checkbox_label')}
            />
          </CheckboxWrapper>
        )}
        <CheckboxWrapper>
          <Checkbox
            onChange={handleCheckboxChange}
            name={CHECKBOXES.terms}
            checked={checkboxes[CHECKBOXES.terms]}
            label={
              <span>
                {t('i_accept')}
                {` `}
                <TermsLink
                  target="_blank"
                  rel="noopener noreferrer"
                  href={t('privacy_policy_link')}
                >
                  {t('privacy_policy')}
                </TermsLink>
              </span>
            }
          />
        </CheckboxWrapper>
        <SubmitButtonWrapper>
          <SubmitButton
            data-testid="submit-btn"
            onClick={handleSubmit}
            label={t('next')}
          />
        </SubmitButtonWrapper>
      </Wrapper>
    </>
  );
}

export {SignScreen};
