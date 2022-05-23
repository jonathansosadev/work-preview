import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {useScrollToTop} from '../../../utils/hooks';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import type {InputEventType, SelectOption} from '../../../utils/types';
import houseIllustration from '../../../assets/house_illustration.svg';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import Button from '../Button';
import WideSelect from '../WideSelect';
import RegisterWideInput from '../WideInput';
import {Wrapper, DimensionsWrapper, Title, Content} from '../../../styled/onboarding';
import {
  TitleWrapper,
  ButtonsWrapper,
  FieldWrapper,
  PressingTile,
  Illustration,
} from './styled';

const PMS_TYPE_OTHER = 'Other';
const PMS_TYPES = {
  smoobu: 'Smoobu',
  guesty: 'Guesty',
  lodgify: 'Lodgify',
  rentals_united: 'Rentals United',
  booking: 'Booking',
  bookingsync: 'BookingSync',
  planyo: 'Planyo',
  hostaway: 'Hostaway',
  mews: 'Mews',
  octorate: 'Octorate',
  villas365: '365 Villas',
  cloudbeds: 'Cloudbeds',
  resharmonics: 'Resharmonics',
  rentlio: 'Rentlio',
  fantasticstay: 'FantasticStay',
  ezee: 'eZee',
  apaleo: 'Apaleo',
  eviivo: 'Eviivo',
  myvr: 'MyVR',
  hoteliga: 'Hoteliga',
  ownerrez: 'OwnerRez',
  datahotel: 'DataHotel',
  hostify: 'Hostify',
  channex: 'Channex',
};

function getPMSOptions() {
  const options = Object.values(PMS_TYPES)
    .map((type) => {
      return {
        value: type,
        label: type,
      };
    })
    .sort((a, b) => a.value.localeCompare(b.value));

  return [...options, {label: PMS_TYPE_OTHER, value: PMS_TYPE_OTHER}];
}

type LocationState = {
  accommodationType: string;
  accommodationsNumber: string;
};

export function PMSTypeRegister() {
  useScrollToTop();
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const customPMSInputRef = React.useRef<HTMLInputElement>(null);
  const pmsOptions = React.useMemo(() => {
    return getPMSOptions();
  }, []);

  const [pmsOption, setPMSOption] = React.useState<SelectOption | null>(null);
  const [customPMS, setCustomPMS] = React.useState('');
  const [isDontWorkWithPMSSelected, setIsDontWorkWithPMSSelected] = React.useState(false);

  const isNextButtonDisabled =
    !pmsOption && !customPMS.trim().length && !isDontWorkWithPMSSelected;

  const goBack = React.useCallback(() => {
    history.push({...location, pathname: '/register/number'});
  }, [history, location]);

  React.useEffect(() => {
    const hasPersistedState =
      location.state &&
      location.state.accommodationType &&
      location.state.accommodationsNumber;

    if (!hasPersistedState) {
      goBack();
    }
  }, [goBack, location.state]);

  React.useEffect(() => {
    mixpanelTrackWithUTM('Onboarding - PMS');
  }, []);

  const resetPMSOption = () => {
    setPMSOption(null);
  };

  const resetCustomPMS = () => {
    setCustomPMS('');
  };

  const resetIsDontWorkWithPMSSelected = () => {
    setIsDontWorkWithPMSSelected(false);
  };

  const resetPMSOptionAndFocusOnCustomPMS = () => {
    resetPMSOption();
    customPMSInputRef.current?.focus();
  };

  const handlePMSOptionSelect = (option: SelectOption) => {
    const isCustomPMSOptionSelected = option.value === PMS_TYPE_OTHER;

    if (isDontWorkWithPMSSelected) {
      resetIsDontWorkWithPMSSelected();
    }
    if (isCustomPMSOptionSelected) {
      resetPMSOptionAndFocusOnCustomPMS();
      return;
    }
    if (customPMS) {
      resetCustomPMS();
    }
    setPMSOption(option);
  };

  const handleCustomPMSChange = ({currentTarget}: InputEventType) => {
    if (pmsOption) {
      resetPMSOption();
    }
    if (isDontWorkWithPMSSelected) {
      resetIsDontWorkWithPMSSelected();
    }

    setCustomPMS(currentTarget.value);
  };

  const toggleIsDontWorkWithPMSSelected = () => {
    if (pmsOption) {
      resetPMSOption();
    }
    if (customPMS) {
      resetCustomPMS();
    }

    setIsDontWorkWithPMSSelected((prevState) => !prevState);
  };

  const getPersistedState = () => {
    return {
      ...location.state,
      isDontWorkWithPMSSelected,
      customPMS,
      pmsOption: pmsOption ? pmsOption.value : null,
    };
  };

  const goNext = () => {
    const shouldGoToForm =
      isDontWorkWithPMSSelected ||
      customPMS ||
      pmsOption?.value === PMS_TYPE_OTHER ||
      pmsOption?.value === PMS_TYPES.datahotel;
    let pathname = '';

    if (shouldGoToForm) {
      pathname = '/register/form';
    }

    if (pmsOption?.value === PMS_TYPES.booking) {
      pathname = '/register/pms/booking';
    }

    if (pmsOption?.value === PMS_TYPES.guesty) {
      pathname = '/register/pms/guesty-sync';
    }

    if (pmsOption?.value === PMS_TYPES.smoobu) {
      pathname = '/register/pms/smoobu-sync';
    }

    if (pmsOption?.value === PMS_TYPES.lodgify) {
      pathname = '/register/pms/lodgify-sync';
    }

    if (pmsOption?.value === PMS_TYPES.rentals_united) {
      pathname = '/register/pms/rentals-united-sync';
    }

    if (pmsOption?.value === PMS_TYPES.booking) {
      pathname = '/register/pms/booking-sync';
    }

    if (pmsOption?.value === PMS_TYPES.hostaway) {
      pathname = '/register/pms/hostaway-sync';
    }

    if (pmsOption?.value === PMS_TYPES.planyo) {
      pathname = '/register/pms/planyo-sync';
    }

    if (pmsOption?.value === PMS_TYPES.mews) {
      pathname = '/register/pms/mews-sync';
    }

    if (pmsOption?.value === PMS_TYPES.bookingsync) {
      pathname = '/register/pms/bookingsync-sync';
    }

    if (pmsOption?.value === PMS_TYPES.octorate) {
      pathname = '/register/pms/octorate-sync';
    }

    if (pmsOption?.value === PMS_TYPES.villas365) {
      pathname = '/register/pms/villas-365-sync';
    }

    if (pmsOption?.value === PMS_TYPES.cloudbeds) {
      pathname = '/register/pms/cloudbeds-sync';
    }

    if (pmsOption?.value === PMS_TYPES.resharmonics) {
      pathname = '/register/pms/resharmonics-sync';
    }

    if (pmsOption?.value === PMS_TYPES.rentlio) {
      pathname = '/register/pms/rentlio-sync';
    }

    if (pmsOption?.value === PMS_TYPES.ezee) {
      pathname = '/register/pms/ezee-sync';
    }

    if (pmsOption?.value === PMS_TYPES.fantasticstay) {
      pathname = '/register/pms/fantasticstay-sync';
    }

    if (pmsOption?.value === PMS_TYPES.apaleo) {
      pathname = '/register/pms/apaleo-sync';
    }

    if (pmsOption?.value === PMS_TYPES.eviivo) {
      pathname = '/register/pms/eviivo-sync';
    }

    if (pmsOption?.value === PMS_TYPES.myvr) {
      pathname = '/register/pms/myvr-sync';
    }

    if (pmsOption?.value === PMS_TYPES.hoteliga) {
      pathname = '/register/pms/hoteliga-sync';
    }

    if (pmsOption?.value === PMS_TYPES.ownerrez) {
      pathname = '/register/pms/ownerrez-sync';
    }

    if (pmsOption?.value === PMS_TYPES.myvr) {
      pathname = '/register/pms/myvr-sync';
    }

    if (pmsOption?.value === PMS_TYPES.hostify) {
      pathname = '/register/pms/hostify-sync';
    }

    if (pmsOption?.value === PMS_TYPES.channex) {
      pathname = '/register/pms/channex-sync';
    }

    if (pmsOption?.value === PMS_TYPES.ezee) {
      pathname = '/register/pms/ezee-sync';
    }

    history.push({
      ...location,
      pathname,
      state: getPersistedState(),
    });
  };

  return (
    <Wrapper>
      <DimensionsWrapper>
        <LeftAlignedChekinLogoHeader />
        <TitleWrapper>
          <Title>{t('are_you_using_pms_or_channel_manager')}</Title>
        </TitleWrapper>
        <Content>
          <FieldWrapper>
            <WideSelect
              hint={t('yes_i_am_using')}
              label={t('select_pms')}
              value={pmsOption}
              onChange={handlePMSOptionSelect}
              options={pmsOptions}
            />
          </FieldWrapper>
          <FieldWrapper>
            <RegisterWideInput
              onChange={handleCustomPMSChange}
              value={customPMS}
              hint={t('i_cannot_find_my_system')}
              label={t('type_your_system_name')}
              ref={customPMSInputRef}
            />
          </FieldWrapper>
          <FieldWrapper>
            <PressingTile
              active={isDontWorkWithPMSSelected}
              onClick={toggleIsDontWorkWithPMSSelected}
            >
              {t('i_dont_work_with_pms')}
            </PressingTile>
          </FieldWrapper>
          <ButtonsWrapper>
            <Button
              light
              size="big"
              onClick={goNext}
              disabled={isNextButtonDisabled}
              label={t('next')}
            />
            <Button light secondary size="big" onClick={goBack} label={t('back')} />
          </ButtonsWrapper>
        </Content>
        <Illustration alt="House" src={houseIllustration} />
      </DimensionsWrapper>
    </Wrapper>
  );
}
