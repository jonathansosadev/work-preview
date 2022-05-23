import React, {Dispatch, SetStateAction} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {
  SECURITY_DEPOSIT_STATUSES,
  MAX_DEPOSIT_AMOUNT,
  MIN_DEPOSIT_AMOUNT,
  SUBSCRIPTION_PRODUCT_TYPES,
} from '../../../utils/constants';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {Housing} from '../../../utils/types';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {useSubscription} from '../../../context/subscription';
import {useIsFormTouched, useModalControls} from '../../../utils/hooks';
import SectionTag, {SectionTagColors} from '../SectionTag';
import Section from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import Selectors from '../Selectors';
import SubscriptionModal from '../SubscriptionModal';
import PaymentsTooltip from '../PaymentsTooltip';
import FormValueController from '../FormValueController';
import {
  AmountInput,
  Content,
  Currency,
  InputWrapper,
  RadioButtonsDescription,
  StyledExemptSourcesSubsection,
} from './styled';

enum FORM_NAMES {
  depositAmount = 'security_deposit_amount',
}

enum FORM_SELECTORS_NAMES {
  deposits_optional = 'security_deposit_status',
  deposits_mandatory = 'security_deposit_status',
}

const selectorsOptions = {
  deposits_optional: SECURITY_DEPOSIT_STATUSES.optional,
  deposits_mandatory: SECURITY_DEPOSIT_STATUSES.mandatory,
};

export const DEPOSIT_DEFAULT_SELECTOR = {
  [FORM_SELECTORS_NAMES.deposits_optional]: SECURITY_DEPOSIT_STATUSES.optional,
};

type FormTypes = {
  [FORM_NAMES.depositAmount]: string;
  [FORM_SELECTORS_NAMES.deposits_optional]: SECURITY_DEPOSIT_STATUSES;
};

const displayFields = {
  [FORM_NAMES.depositAmount]: true,
};

type HousingSecurityDepositSectionProps = {
  disabled: boolean;
  setIsSectionTouched: (isTouched: boolean) => void;
  housing?: Housing;
  handlePaymentSectionToggle: (isSectionActive: boolean) => boolean;
  setSecurityDepositSectionActive: Dispatch<SetStateAction<boolean>>;
};

const HousingSecurityDepositSection = ({
  disabled,
  setIsSectionTouched,
  housing,
  handlePaymentSectionToggle,
  setSecurityDepositSectionActive,
}: HousingSecurityDepositSectionProps) => {
  const {t} = useTranslation();
  const {
    register,
    watch,
   control, setValue,
    formState: {errors},
  } = useFormContext<FormTypes>();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {isFormTouched, setUntouchedValues} = useIsFormTouched({
    displayFields,
    watch,
  });
  const {isDepositActive, isTrialMode} = useSubscription();

  const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);
  const housingDepositAmount =
    housing?.security_deposit_amount && String(housing?.security_deposit_amount);
  const isInactive =
    !housing || housing?.security_deposit_status === SECURITY_DEPOSIT_STATUSES.inactive;

  const preloadedSectionActive = Boolean(housing && !isInactive);
  const {
    isSectionActive,
    toggleIsSectionActive,
    setIsSectionActive,
    isSectionActiveTouched,
  } = useSwitchSectionActive(preloadedSectionActive, {
    canToggle: handlePaymentSectionToggle,
  });

  const {
    isOpen: isSubscriptionModalOpen,
    openModal: openSubscriptionModal,
    closeModal: closeSubscriptionModal,
  } = useModalControls();

  React.useEffect(
    function syncLocalStateWithParentState() {
      setSecurityDepositSectionActive(isSectionActive);
    },
    [isSectionActive, setSecurityDepositSectionActive],
  );

  React.useEffect(() => {
    setIsSectionTouched(isFormTouched || isSectionActiveTouched || isSelectorsTouched);
  }, [isFormTouched, isSelectorsTouched, setIsSectionTouched, isSectionActiveTouched]);

  React.useEffect(
    function preloadDefaultStatus() {
      if (isSectionActive && isInactive) {
        setValue(
          FORM_SELECTORS_NAMES.deposits_optional,
          SECURITY_DEPOSIT_STATUSES.optional,
        );
      }
    },
    [isSectionActive, isInactive, setValue],
  );

  React.useEffect(
    function loadHousingDepositAmount() {
      if (housingDepositAmount) {
        setValue(FORM_NAMES.depositAmount, housingDepositAmount);
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.depositAmount]: housingDepositAmount,
          };
        });
      }
    },
    [housing, housingDepositAmount, setUntouchedValues, setValue],
  );

  const setSectionTouched = () => {
    if (typeof setIsSectionTouched === 'function') {
      setIsSectionTouched(true);
    }
  };

  const toggleSectionActive = () => {
    if (!isSectionActive && !isDepositActive && !isTrialMode) {
      openSubscriptionModal();
      return;
    }

    toggleIsSectionActive();
  };

  return (
    <Section
      title={
        <div>
          {t('security_deposit_title')}
          <SectionTag color={SectionTagColors.BLUE} label={t('premium')} />
        </div>
      }
      subtitle={t('security_deposit_subtitle')}
      subtitleTooltip={
        <PaymentsTooltip
          currencyLabel={paymentSettingsCurrencyLabel}
          title={t('deposit_payments_tooltip_title')}
        />
      }
    >
      <Switch
        checked={isSectionActive}
        onChange={toggleSectionActive}
        label={t('activate_deposits')}
        disabled={disabled}
      />
      {isSectionActive && (
        <Content>
          <InputWrapper>
            <FormValueController name={FORM_NAMES.depositAmount}>
              {(isEmpty) => (
                <AmountInput
                  empty={isEmpty}
                  {...register(FORM_NAMES.depositAmount, {
                    required: t('required') as string,
                    min: {
                      value: MIN_DEPOSIT_AMOUNT,
                      message: t('min_number_is', {number: MIN_DEPOSIT_AMOUNT}),
                    },
                    max: {
                      value: MAX_DEPOSIT_AMOUNT,
                      message: t('max_number_is', {number: MAX_DEPOSIT_AMOUNT}),
                    },
                  })}
                  control={control}disabled={disabled}
                  error={errors[FORM_NAMES.depositAmount]?.message}
                  label={t('deposit_amount')}
                  placeholder={t('enter_amount')}
                  name={FORM_NAMES.depositAmount}
                  defaultValue={housingDepositAmount}
                  type="number"
                  inputMode="numeric"
                  step="0.01"
                />
              )}
            </FormValueController>
            <Currency>{paymentSettingsCurrencyLabel}</Currency>
          </InputWrapper>
          <StyledExemptSourcesSubsection
            disabled={disabled}
            housing={housing}
            formName={HOUSING_FORM_NAMES.deposit_exempt_sources}
            onChange={setSectionTouched}
          />
          <RadioButtonsDescription>
            {t('select_mandatory_or_optional_deposit')}
          </RadioButtonsDescription>
          <Selectors
            selectorsFormNames={FORM_SELECTORS_NAMES}
            preloadedSelectorsData={housing?.security_deposit_status}
            disabled={disabled}
            setIsSelectorsTouched={setIsSelectorsTouched}
            radioValues={selectorsOptions}
          />
        </Content>
      )}
      <SubscriptionModal
        open={isSubscriptionModalOpen}
        onClose={closeSubscriptionModal}
        setSectionTouched={setSectionTouched}
        setIsSectionActive={setIsSectionActive}
        onUpgradeToPremium={closeSubscriptionModal}
        subscriptionProductType={SUBSCRIPTION_PRODUCT_TYPES.deposit}
        subtitle={
          <Trans i18nKey="security_deposit_premium_feature_subtitle">
            <div>
              <strong>Security Deposit</strong> is a premium feature that allows you to
              request a retention for the deposit amount that you will be able to charge
              in case it's necessary. This feature enables an extra step on the online
              check-in process for the guest to add a payment card and authorize the
              retention of the security deposit. The subscription is additional to your
              basic plan.
            </div>
            <p>
              <a href={t('security_deposit_link')} target="_blank" rel="noreferrer">
                Learn more
              </a>{' '}
              about how to set up the Tourist taxes.
            </p>
          </Trans>
        }
      />
    </Section>
  );
};

export {HousingSecurityDepositSection};
