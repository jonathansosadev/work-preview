import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import i18n from '../../../i18n';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';
import {useIsFormTouched} from '../../../utils/hooks';
import {ExternalSource} from '../../../utils/types';
import Section from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import {InputController} from '../Input';
import {Content} from './styled';
import {FieldsVerticalGridLayout} from '../../../styled/common';
import testicon from '../../../assets/logo-alea.png';//test

export enum FORM_NAMES {
  airbnb = 'AIRBNB_CALENDAR',
  booking = 'BOOKING_CALENDAR',
  other = 'GENERIC_CALENDAR',
}

const TOOLTIP_CONTENT = (
  <>
    <Trans i18nKey="icals_tooltip">
        <p>
          Synched iCals will automatically create the reservations based on the information contained on the iCal.
          <br />
          Please note that iCals have some limitations, if a reservation date is changed and updated in the iCal, Chekin won't update the existing reservation with new data but it will create a new reservation with the new dates. 
        </p>
      </Trans>
      <a href='https://support.chekin.com/knowledge/how-do-ical-work-in-chekin' target="_blank" rel="noopener noreferrer">{i18n.t('icals_link')}</a>
  </>
);

const displayFields = {
  [FORM_NAMES.airbnb]: true,
  [FORM_NAMES.booking]: true,
  [FORM_NAMES.other]: true,
};

const defaultValues = {
  [FORM_NAMES.airbnb]: '',
  [FORM_NAMES.other]: '',
  [FORM_NAMES.booking]: '',
};

type HousingICalsSectionProps = {
  disabled: boolean;
  initICals?: Array<ExternalSource>;
  setIsSectionTouched?: (isTouched: boolean) => void;
};
const divStyle = {
  display: 'none',
};

function HousingICalsSection({
  disabled,
  initICals,
  setIsSectionTouched,
}: HousingICalsSectionProps) {
  const {t} = useTranslation();
  const {
    register,
    setValue,
    watch,
    control,
    formState: {errors},
  } = useFormContext();
  const {isFormTouched, setUntouchedValues} = useIsFormTouched({
    displayFields,
    defaultValues,
    watch,
  });

  const preloadedSectionActive = !!initICals?.length;

  const {
    isSectionActive,
    toggleIsSectionActive,
    setIsSectionActive,
    isSectionActiveTouched,
  } = useSwitchSectionActive(preloadedSectionActive);

  React.useEffect(() => {
    if (typeof setIsSectionTouched === 'function') {
      setIsSectionTouched(isFormTouched || isSectionActiveTouched);
    }
  }, [isFormTouched, setIsSectionTouched, isSectionActiveTouched]);

  React.useEffect(() => {
    if (initICals?.length) {
      setIsSectionActive(true);
    }
  }, [initICals, setIsSectionActive]);

  React.useEffect(() => {
    if (initICals?.length && isSectionActive) {
      const formValues = initICals.map((item) => {
        const iCal = {
          name: item.type,
          value: item.url,
        };

        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [iCal.name]: iCal.value,
          };
        });
        return iCal;
      });

      formValues.forEach(({name, value}) => {
        setValue(name, value);
      });
    }
  }, [isSectionActive, initICals, setValue, setUntouchedValues]);

  const UrlInput = (formName: keyof typeof FORM_NAMES) => {
    return (
      <InputController
        {...register(FORM_NAMES[formName])}
        control={control}
        label={getRequiredOrOptionalFieldLabel(t(formName), false)}
        error={errors[FORM_NAMES[formName]]?.message}
        placeholder={t('enter_url')}
        disabled={disabled}
      />
    );
  };

  return (
    <Section
      title={t('icals_connection_title')}
      subtitle={t('icals_connection_subtitle')}
      subtitleTooltip={TOOLTIP_CONTENT}
    > 
      <img src={testicon} style={divStyle} alt="test" />
      <Content>
        <Switch
          checked={isSectionActive}
          onChange={toggleIsSectionActive}
          label={t('activate_icals')}
          disabled={disabled}
        />
        {isSectionActive && (
          <FieldsVerticalGridLayout>
            {UrlInput('booking')}
            {UrlInput('airbnb')}
            {UrlInput('other')}
          </FieldsVerticalGridLayout>
        )}
      </Content>
    </Section>
  );
}

export {HousingICalsSection};
