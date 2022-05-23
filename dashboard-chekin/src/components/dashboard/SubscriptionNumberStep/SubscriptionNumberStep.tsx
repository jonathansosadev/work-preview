import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useHistory, useLocation, Link} from 'react-router-dom';
import {InputEventType} from '../../../utils/types';
import {useSubscription} from '../../../context/subscription';
import ModalButton from '../ModalButton';
import {Heading} from '../../../styled/common';
import {
  Content,
  Header,
  SubHeader,
  Tip,
  NumberOFRoomsInput,
  NextButton,
  Tooltip,
  CancelButtonWrapper,
} from './styled';

const MIN_PROPERTIES_NUMBER = 1;
const MIN_ROOMS_NUMBER = 10;

type LocationState = {
  accommodationsNumber?: string;
};

function SubscriptionNumberStep() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {
    subscription,
    isSubscriptionRequired,
    inactiveSubscriptions,
    isSubscriptionCanceled,
    isHotelSubscription,
    isLoading: isLoadingSubscription,
  } = useSubscription();
  const [
    isInitAccommodationsNumberSet,
    setIsInitAccommodationsNumberSet,
  ] = React.useState(false);
  const [accommodationsNumber, setAccommodationsNumber] = React.useState<string>('');
  const [minAccommodationsNumber, setMinAccommodationsNumber] = React.useState(() => {
    return isHotelSubscription ? MIN_ROOMS_NUMBER : MIN_PROPERTIES_NUMBER;
  });
  const currentSubscriptionQuantity = subscription?.current_accommodations_qty?.CHEKIN;

  const isNextButtonDisabled =
    !accommodationsNumber ||
    Boolean(
      accommodationsNumber && minAccommodationsNumber > Number(accommodationsNumber || 0),
    );

  const setMinNumber = React.useCallback(
    (number?: number) => {
      if (isHotelSubscription) {
        if (number && number < MIN_ROOMS_NUMBER) {
          setMinAccommodationsNumber(MIN_ROOMS_NUMBER);
          return;
        }

        setMinAccommodationsNumber(number || MIN_ROOMS_NUMBER);
      } else {
        if (number && number < MIN_PROPERTIES_NUMBER) {
          setMinAccommodationsNumber(MIN_PROPERTIES_NUMBER);
          return;
        }

        setMinAccommodationsNumber(number || MIN_PROPERTIES_NUMBER);
      }
    },
    [isHotelSubscription],
  );

  React.useLayoutEffect(() => {
    const persistedAccommodationsNumber = location.state?.accommodationsNumber;

    if (persistedAccommodationsNumber) {
      setAccommodationsNumber(persistedAccommodationsNumber);
    }

    if (isLoadingSubscription) {
      return;
    }

    if (
      !isInitAccommodationsNumberSet &&
      isSubscriptionCanceled &&
      inactiveSubscriptions?.length
    ) {
      const prevNumber =
        inactiveSubscriptions[0]?.current_accommodations_qty?.CHEKIN || 0;
      if (!persistedAccommodationsNumber) {
        setAccommodationsNumber(prevNumber);
      }

      setMinNumber(prevNumber);
      setIsInitAccommodationsNumberSet(true);
      return;
    }

    if (
      !isLoadingSubscription &&
      !isInitAccommodationsNumberSet &&
      !persistedAccommodationsNumber
    ) {
      const qty = currentSubscriptionQuantity || 0;
      if (isHotelSubscription) {
        if (qty < MIN_ROOMS_NUMBER) {
          setAccommodationsNumber(String(MIN_ROOMS_NUMBER));
        } else {
          setAccommodationsNumber(String(qty));
        }
      } else {
        if (qty < MIN_PROPERTIES_NUMBER) {
          setAccommodationsNumber(String(MIN_PROPERTIES_NUMBER));
        } else {
          setAccommodationsNumber(String(qty));
        }
      }

      setMinNumber(currentSubscriptionQuantity);
      setIsInitAccommodationsNumberSet(true);
    }
  }, [
    setMinNumber,
    isSubscriptionCanceled,
    inactiveSubscriptions,
    isInitAccommodationsNumberSet,
    isLoadingSubscription,
    currentSubscriptionQuantity,
    location.state,
    isHotelSubscription,
  ]);

  React.useEffect(() => {
    if (!isSubscriptionRequired) {
      history.push('/account');
    }
  }, [history, isSubscriptionRequired]);

  const handleNumberOfRoomsChange = (event: InputEventType) => {
    const value = event.target?.value;
    setAccommodationsNumber(value);
  };

  const onIncrement = () => {
    setAccommodationsNumber((prevState) => {
      const number = Number(prevState || 0);

      if (number + 1 < minAccommodationsNumber) {
        return String(minAccommodationsNumber);
      }
      return String(number + 1);
    });
  };

  const onDecrement = () => {
    setAccommodationsNumber((prevState) => {
      const number = Number(prevState || 0);

      if (number - 1 < minAccommodationsNumber) {
        return String(minAccommodationsNumber);
      }
      return String(number - 1);
    });
  };

  const getPersistedState = () => {
    return {
      ...location.state,
      accommodationsNumber: accommodationsNumber,
    };
  };

  const goNext = () => {
    const persistedState = getPersistedState();
    history.push('/subscription/select-plan', persistedState);
  };

  return (
    <Content>
      <Heading>
        <div />
        <Header>{t('subscription')}</Header>
        <div />
      </Heading>
      <SubHeader>
        {isHotelSubscription ? t('number_of_rooms') : t('number_of_properties')}
        {isHotelSubscription && (
          <Tooltip
            content={
              <Trans
                i18nKey="subscription_is_min_number_per_property"
                values={{number: MIN_ROOMS_NUMBER}}
              >
                Subscription of minimum of <b>{{MIN_ROOMS_NUMBER}}</b> rooms per property
              </Trans>
            }
          />
        )}
      </SubHeader>
      <NumberOFRoomsInput
        showNumberButtons
        value={accommodationsNumber}
        empty={!accommodationsNumber}
        placeholder={t('enter_number')}
        type="number"
        error={
          Boolean(
            accommodationsNumber &&
              Number(accommodationsNumber || 0) < minAccommodationsNumber,
          ) && t('cannot_be_less_than', {number: minAccommodationsNumber})
        }
        onChange={handleNumberOfRoomsChange}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />
      <Tip>{isHotelSubscription ? t('active_rooms') : t('active_properties')}</Tip>
      <NextButton
        label={t('next')}
        disabled={isNextButtonDisabled}
        onClick={goNext}
        secondary
      />
      <Link to="/properties">
        <CancelButtonWrapper>
          <ModalButton label={t('cancel')} secondary />
        </CancelButtonWrapper>
      </Link>
    </Content>
  );
}

export {SubscriptionNumberStep};
