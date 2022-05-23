import React, {Dispatch, SetStateAction} from 'react';
import i18n from 'i18next';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {useErrorModal, useModalControls} from '../../../utils/hooks';
import {useSubscription} from '../../../context/subscription';
import {getCountryCode} from '../../../utils/housing';
import {
  COUNTRY_CODES,
  SUBSCRIPTION_PRODUCT_TYPES,
  HOUSING_VERIFICATION_TYPE,
} from '../../../utils/constants';
import {HOUSING_FORM_NAMES} from '../../../utils/formNames';
import Section from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import SectionTag, {SectionTagColors} from '../SectionTag';
import Selectors from '../Selectors';
import Tooltip from '../Tooltip';
import SubscriptionModal from '../SubscriptionModal';
import SwitchBlocks from '../SwitchBlocks';
import {DescriptionText, Subtitle, SwitchLabel} from './styled';

enum IdentityGuestSettingsOptions {
  guest_leader = 'is_biometric_match_for_all_enabled',
  all_guests = 'is_biometric_match_for_all_enabled',
}
const identityOptions = {
  guest_leader: 'false',
  all_guests: 'true',
};

const switchBlockOptions = [
  {
    title: i18n.t('official_document_and_selfie'),
    subtitle: i18n.t('official_document_and_selfie_description'),
    value: HOUSING_VERIFICATION_TYPE.mandatoryDocumentAndSelfie,
    switch: {
      value: HOUSING_VERIFICATION_TYPE.optionalDocumentAndSelfie,
      label: (
        <SwitchLabel>
          {i18n.t('optional_first_upper')}
          <Tooltip content={i18n.t('identity_verification_switch_optional_tooltip')} />
        </SwitchLabel>
      ),
    },
  },
  {
    title: i18n.t('official_document_only'),
    subtitle: i18n.t('only_official_identity_document_description'),
    value: HOUSING_VERIFICATION_TYPE.mandatoryDocumentOnly,
    switch: {
      value: HOUSING_VERIFICATION_TYPE.optionalDocumentOnly,
      label: (
        <SwitchLabel>
          {i18n.t('optional_first_upper')}
          <Tooltip content={i18n.t('identity_verification_switch_optional_tooltip')} />
        </SwitchLabel>
      ),
    },
  },
];

type HousingSelfCheckinSectionProps = {
  setIsSectionTouched: Dispatch<SetStateAction<boolean>>;
  setIsSubmitDisabled?: Dispatch<SetStateAction<boolean>>;
  isPoliceConnectionActive: boolean;
  disabled?: boolean;
  housing?: any;
};

const defaultProps: Partial<HousingSelfCheckinSectionProps> = {
  disabled: false,
};

const HousingIdentityVerificationSection = React.forwardRef(
  (
    {
      disabled,
      housing,
      setIsSectionTouched,
      setIsSubmitDisabled,
      isPoliceConnectionActive,
    }: HousingSelfCheckinSectionProps,
    ref,
  ) => {
    const {t} = useTranslation();
    const {watch} = useFormContext();
    const {isIdentityVerificationActive, isTrialMode} = useSubscription();
    const {ErrorModal} = useErrorModal();
    const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);
    const [isSwitchBlocksTouched, setIsSwitchBlocksTouched] = React.useState(false);

    const selectedCountryHousingCode = watch(HOUSING_FORM_NAMES.country)?.value;
    const countryHousingCode = getCountryCode(housing);
    const isSelectedDubai = selectedCountryHousingCode === COUNTRY_CODES.uae;
    const isCountryDubai = countryHousingCode === COUNTRY_CODES.uae;
    const isPoliceActiveAndDubai = isSelectedDubai && isPoliceConnectionActive;

    const preloadedSectionActive = React.useMemo(() => {
      if (isSelectedDubai && !isCountryDubai) {
        return true;
      }
      return Boolean(housing?.[HOUSING_FORM_NAMES.is_self_online_check_in_enabled]);
    }, [isCountryDubai, housing, isSelectedDubai]);

    const isBiometricMatchAll = React.useMemo(() => {
      if (isSelectedDubai && !isCountryDubai) {
        return true;
      }
      return Boolean(housing?.is_biometric_match_for_all_enabled);
    }, [isCountryDubai, housing, isSelectedDubai]);

    const verificationType = React.useMemo(() => {
      if (countryHousingCode === selectedCountryHousingCode) {
        return housing?.[HOUSING_FORM_NAMES.verification_type];
      }
      return isSelectedDubai
        ? switchBlockOptions[1].value
        : switchBlockOptions[0].switch.value;
    }, [countryHousingCode, housing, isSelectedDubai, selectedCountryHousingCode]);

    const {
      isOpen: isSubscriptionModalOpen,
      openModal: openSubscriptionModal,
      closeModal: closeSubscriptionModal,
    } = useModalControls();

    const {
      isSectionActive,
      toggleIsSectionActive,
      setIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(preloadedSectionActive);

    React.useImperativeHandle(ref, () => {
      return {
        active: isSectionActive,
      };
    });

    React.useEffect(() => {
      if (isPoliceActiveAndDubai) {
        setIsSectionActive(true);
      }
    }, [isPoliceActiveAndDubai, setIsSectionActive]);

    React.useEffect(
      function handleSubmitDisable() {
        if (!setIsSubmitDisabled) {
          return;
        }

        setIsSubmitDisabled(false);
      },
      [isSectionActive, setIsSubmitDisabled],
    );

    React.useEffect(
      function handleIsSectionTouched() {
        const isFormTouched =
          isSectionActiveTouched || isSelectorsTouched || isSwitchBlocksTouched;
        setIsSectionTouched(isFormTouched);
      },
      [
        setIsSectionTouched,
        isSectionActiveTouched,
        isSelectorsTouched,
        isSwitchBlocksTouched,
      ],
    );

    const toggleSectionActive = () => {
      if (!isSectionActive && !isIdentityVerificationActive && !isTrialMode) {
        openSubscriptionModal();
        return;
      }

      toggleIsSectionActive();
    };

    const setSectionTouched = () => {
      if (setIsSectionTouched) {
        setIsSectionTouched(true);
      }
    };

    return (
      <>
        <Section
          title={
            <>
              {t('identity_verification')}
              <SectionTag color={SectionTagColors.BLUE} label={t('premium')} />
            </>
          }
          subtitle={
            <>
              <Subtitle>
                {t('identity_verification_subtitle')}
                <Tooltip content={t('identity_verification_subtitle_tooltip')} />
              </Subtitle>
            </>
          }
        >
          {!isPoliceActiveAndDubai && (
            <Switch
              checked={isSectionActive}
              onChange={toggleSectionActive}
              label={t('activate_identity_verification')}
              disabled={disabled}
            />
          )}
          {isSectionActive && (
            <>
              <div>
                <DescriptionText>
                  {t('select_verify_guests_identity') + ':'}
                </DescriptionText>
                <SwitchBlocks
                  field={HOUSING_FORM_NAMES.verification_type}
                  options={switchBlockOptions}
                  preloadData={verificationType}
                  setIsSwitchBlocksTouched={setIsSwitchBlocksTouched}
                  disabled={disabled}
                />
              </div>
              <div>
                <DescriptionText>
                  {t('activate_identity_verification_description')}
                </DescriptionText>
                <Selectors
                  isTabType={true}
                  selectorsFormNames={IdentityGuestSettingsOptions}
                  preloadedSelectorsData={String(isBiometricMatchAll)}
                  disabled={disabled}
                  setIsSelectorsTouched={setIsSelectorsTouched}
                  radioValues={identityOptions}
                />
              </div>
            </>
          )}
        </Section>
        <SubscriptionModal
          open={isSubscriptionModalOpen}
          onClose={closeSubscriptionModal}
          setSectionTouched={setSectionTouched}
          setIsSectionActive={setIsSectionActive}
          onUpgradeToPremium={closeSubscriptionModal}
          subscriptionProductType={SUBSCRIPTION_PRODUCT_TYPES.idVerification}
          subtitle={t('identity_verification_premium_feature_subtitle')}
        />
        <ErrorModal />
      </>
    );
  },
);

HousingIdentityVerificationSection.defaultProps = defaultProps;
export {HousingIdentityVerificationSection};
