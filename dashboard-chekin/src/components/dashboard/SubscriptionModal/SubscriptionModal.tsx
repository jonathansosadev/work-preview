import React, {Dispatch, SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import type {InputEventType, Plan} from '../../../utils/types';
import {useErrorToast} from '../../../utils/hooks';
import {useSubscription} from '../../../context/subscription';
import {ErrorMessage} from '../../../styled/common';
import {
  CURRENCIES,
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_PRODUCT_TYPES,
} from '../../../utils/constants';
import {PlanTotalPrice} from '../../../utils/types';
import {getSubscriptionInterval, getSubscriptionPlan} from '../../../utils/subscription';
import {useDebounce} from '../../../utils/hooks';
import {useUser} from '../../../context/user';
import {useComputedDetails} from '../../../context/computedDetails';
import api, {queryFetcher} from '../../../api';
import minusIcon from '../../../assets/minus.svg';
import plusIcon from '../../../assets/plus.svg';
import xIcon from '../../../assets/x_blue.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import Loader from '../../common/Loader';
import {
  contentStyle,
  Subtitle,
  Title,
  Input,
  InputLabel,
  SpinnerButton,
  SpinnerButtonsWrapper,
  SpinnerIcon,
  InputWrapper,
  PriceContainer,
  Price,
  PriceTitle,
  Main,
  Currency,
  PriceSubtitle,
  LoaderWrapper,
  CloseButton,
} from './styled';

const minAccommodationsNumber = 1;
const maxAccommodationsNumber = 99999;
const maxAccommodationsNumberLength = 5;
const accommodationsNumberDebounceDelayMs = 500;

function fetchPlan(
  subscriptionType: string,
  subscriptionProductType: string,
  subscriptionInterval: string,
  currency: CURRENCIES,
) {
  const params = `type=${subscriptionType}&interval=${subscriptionInterval}&product=${subscriptionProductType}&currency=${currency}`;
  return queryFetcher(api.payments.ENDPOINTS.plans(params));
}

function fetchPlanPrice(planId: string, quantity = 0) {
  return queryFetcher(
    api.payments.ENDPOINTS.planTotalPrice(planId, `quantity=${quantity}`),
  );
}

export type SubscriptionModalProps = {
  open: boolean;
  subscriptionProductType: SUBSCRIPTION_PRODUCT_TYPES;
  onClose: () => void;
  onUpgradeToPremium?: () => void;
  setIsSectionActive?: Dispatch<SetStateAction<boolean>>;
  setSectionTouched?: () => void;
  title?: string;
  subtitle?: string | React.ReactNode;
  disabled?: boolean;
};

const defaultProps: Partial<SubscriptionModalProps> = {
  open: false,
  subscriptionProductType: SUBSCRIPTION_PRODUCT_TYPES.chekin,
  onClose: () => {},
  onUpgradeToPremium: () => {},
  setIsSectionActive: () => {},
  setSectionTouched: () => {},
  title: '',
  subtitle: '',
  disabled: false,
};

function SubscriptionModal({
  open,
  onClose,
  onUpgradeToPremium,
  setIsSectionActive,
  setSectionTouched,
  subscriptionProductType,
  title,
  subtitle,
  disabled,
}: SubscriptionModalProps) {
  const {t} = useTranslation();
  const user = useUser();
  const {currency, currencyLabel} = useComputedDetails();
  const {isHotelSubscription, subscription, checkIsProductActive} = useSubscription();
  const isPlanActive = checkIsProductActive(subscriptionProductType);
  const [accommodationsNumber, setAccommodationsNumber] = React.useState(() => {
    return user?.housings_quantity || '';
  });
  const [accommodationsNumberError, setAccommodationsNumberError] = React.useState('');
  const debouncedAccommodationsNumber = useDebounce(
    accommodationsNumber,
    accommodationsNumberDebounceDelayMs,
  );

  const subscriptionType = user?.subscription_type;
  const subscriptionInterval =
    getSubscriptionInterval(subscription) || SUBSCRIPTION_INTERVALS.month;
  const {data: plan, error: planError, status: planStatus} = useQuery<Plan>(
    [`planKey`, subscriptionProductType, subscriptionType, subscriptionInterval],
    () =>
      fetchPlan(
        subscriptionType!,
        subscriptionProductType,
        subscriptionInterval!,
        currency,
      ),
    {
      enabled: Boolean(subscriptionType && subscriptionInterval && currency),
    },
  );
  useErrorToast(planError, {
    notFoundMessage: `Plan could not be found. Please contact support.`,
  });

  const activePlanId = getSubscriptionPlan(subscription, subscriptionProductType);
  const planId = isPlanActive ? activePlanId : plan?.unique_id;

  const {
    data: planTotalPrice,
    error: planTotalPriceError,
    status: planTotalPriceStatus,
  } = useQuery<PlanTotalPrice, [string, string, number?]>(
    [
      `planPriceKey`,
      subscriptionProductType,
      planId,
      Number(debouncedAccommodationsNumber),
    ],
    () => fetchPlanPrice(planId!, Number(debouncedAccommodationsNumber)),
    {
      enabled: Boolean(planId),
    },
  );
  useErrorToast(planTotalPriceError, {
    notFoundMessage: 'Requested plan price could not be found. Please contact support',
  });

  React.useEffect(() => {
    if (accommodationsNumber && Number(accommodationsNumber) < minAccommodationsNumber) {
      setAccommodationsNumberError(t('min_number_is', {number: minAccommodationsNumber}));
    } else {
      setAccommodationsNumberError('');
    }
  }, [accommodationsNumber, t]);

  const incrementAccommodationsNumber = () => {
    setAccommodationsNumber((prevState) => {
      const number = Number(prevState);

      if (number < minAccommodationsNumber) {
        return String(minAccommodationsNumber);
      }
      if (number >= maxAccommodationsNumber) {
        return prevState;
      }
      return String(number + 1);
    });
  };

  const decrementAccommodationsNumber = () => {
    setAccommodationsNumber((prevState) => {
      const number = Number(prevState);

      if (number <= minAccommodationsNumber) {
        return String(minAccommodationsNumber);
      }
      return String(number - 1);
    });
  };

  const handleAccommodationsNumberChange = (event: InputEventType) => {
    const number = event.target.value;

    if (
      number.length > maxAccommodationsNumberLength ||
      Number(number) > maxAccommodationsNumber
    ) {
      return;
    }
    setAccommodationsNumber(number);
  };

  const getPlanPriceSubtitle = () => {
    const isYearlySubscriptionInterval =
      subscriptionInterval === SUBSCRIPTION_INTERVALS.year;
    const displayNumber =
      accommodationsNumber === '' || accommodationsNumber < 0 ? 0 : accommodationsNumber;

    if (isYearlySubscriptionInterval) {
      return isHotelSubscription
        ? t('year_per_number_rooms', {number: displayNumber})
        : t('year_per_number_properties', {number: displayNumber});
    }

    return isHotelSubscription
      ? t('month_per_number_rooms', {number: displayNumber})
      : t('month_per_number_properties', {number: displayNumber});
  };

  const getPlanTotalPrice = () => {
    if (planTotalPriceStatus === 'loading') {
      return <Loader height={30} width={30} />;
    }

    return (
      <div>
        {planTotalPrice?.price_with_tax || planTotalPrice?.price || '0.00'}{' '}
        <Currency>{currencyLabel}</Currency>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (onUpgradeToPremium) onUpgradeToPremium();

    if (setIsSectionActive && setSectionTouched) {
      setIsSectionActive(true);
      setSectionTouched();
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Modal
      open
      closeOnDocumentClick
      closeOnEscape
      onClose={onClose}
      contentStyle={contentStyle}
    >
      <React.Suspense
        fallback={
          <LoaderWrapper>
            <Loader height={45} width={45} label={t('loading')} />
          </LoaderWrapper>
        }
      >
        <CloseButton onClick={onClose}>
          <img src={xIcon} alt="Cross" />
        </CloseButton>
        <Title>{title || t('premium_feature')}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <Main>
          <div>
            <InputLabel htmlFor="propertiesNumber">
              {isHotelSubscription
                ? t('enter_number_of_rooms')
                : t('enter_number_of_properties')}
            </InputLabel>
            <InputWrapper>
              <Input
                id="propertiesNumber"
                error={accommodationsNumberError}
                placeholder={t('enter_number')}
                onChange={handleAccommodationsNumberChange}
                value={accommodationsNumber}
                type="number"
                min={minAccommodationsNumber}
                max={maxAccommodationsNumber}
              />
              <SpinnerButtonsWrapper>
                <SpinnerButton onClick={decrementAccommodationsNumber} type="button">
                  <SpinnerIcon src={minusIcon} alt="Minus" />
                </SpinnerButton>
                <SpinnerButton onClick={incrementAccommodationsNumber} type="button">
                  <SpinnerIcon src={plusIcon} alt="Plus" />
                </SpinnerButton>
              </SpinnerButtonsWrapper>
              <ErrorMessage>{accommodationsNumberError}</ErrorMessage>
            </InputWrapper>
          </div>
          <div>
            <PriceContainer>
              <PriceTitle>{t('price')}:</PriceTitle>
              <Price>
                {planStatus === 'loading' ? (
                  <Loader height={20} width={20} />
                ) : (
                  <div>{getPlanTotalPrice()}</div>
                )}
              </Price>
              <PriceSubtitle>{getPlanPriceSubtitle()}</PriceSubtitle>
              <ModalButton
                disabled={
                  disabled || !accommodationsNumber || Boolean(accommodationsNumberError)
                }
                onClick={handleSubmit}
                label={t('upgrade_to_premium')}
              />
            </PriceContainer>
          </div>
        </Main>
      </React.Suspense>
    </Modal>
  );
}

SubscriptionModal.defaultProps = defaultProps;
export {SubscriptionModal};
