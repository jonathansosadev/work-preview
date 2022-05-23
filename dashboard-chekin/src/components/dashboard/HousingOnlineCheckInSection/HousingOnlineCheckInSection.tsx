import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import {useUser} from 'context/user';
import i18n from '../../../i18n';
import OnlineSendingSettings, {ACTION_TYPES} from '../OnlineSendingSettings';
import {
  DEFAULT_LANGUAGE,
  EMAIL_SENDING_SETTINGS_TYPES,
  LANGUAGE_OPTIONS,
} from '../../../utils/constants';
import {useIsFormTouched} from 'utils/hooks';
import {Housing} from '../../../utils/types';
import {FormTypes} from '../AddHousingSections';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import Section from '../Section';
import Select from '../Select';
import {TooltipContentItem, SelectWrapper} from './styled';

const TOOLTIP_CONTENT = (
  <>
    <TooltipContentItem>
      {i18n.t('checkin_online_section_tooltip_first_part')}
    </TooltipContentItem>
    <TooltipContentItem>
      {i18n.t('checkin_online_section_tooltip_second_part')}
    </TooltipContentItem>
  </>
);

const displayFields = {
  [HOUSING_FORM_NAMES.email_language]: true,
};

type HousingOnlineCheckInSectionProps = {
  disabled: boolean;
  housing?: Housing;
  setIsSectionTouched: (isTouched: boolean) => void;
  setIsSaveDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultProps: Partial<HousingOnlineCheckInSectionProps> = {
  disabled: false,
  housing: undefined,
};

const HousingOnlineCheckInSection = React.forwardRef(
  ({disabled, housing, state, dispatch}: HousingOnlineCheckInSectionProps | any, ref) => {
    const {t} = useTranslation();
    const user = useUser();

    const {control, watch, setValue} = useFormContext<FormTypes>();

    const sendingSettingsId =
      housing?.checkin_online_sending_settings_id ||
      user?.checkin_online_sending_settings_id;

    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      displayFields,
      watch,
    });

    React.useEffect(
      function handleSectionTouched() {
        dispatch({type: ACTION_TYPES.touched, payload: isFormTouched});
      },
      [dispatch, isFormTouched],
    );

    React.useEffect(
      function preloadHousingLanguage() {
        if (!housing) return;
        const housingLanguage = housing.default_email_language;

        const housingLanguageOptions = LANGUAGE_OPTIONS.find(
          (lang) => lang.value === housingLanguage,
        );

        if (housingLanguage) {
          setValue(HOUSING_FORM_NAMES.email_language, housingLanguageOptions);
          setUntouchedValues((prevState) => {
            return {
              ...prevState,
              [HOUSING_FORM_NAMES.email_language]: housingLanguageOptions,
            };
          });
        }
      },
      [housing, setUntouchedValues, setValue],
    );

    return (
      <Section
        title={t('online_check_in')}
        subtitle={t('online_check_in_subtitle')}
        subtitleTooltip={TOOLTIP_CONTENT}
      >
        <SelectWrapper>
          <Controller
            control={control}
            name={HOUSING_FORM_NAMES.email_language}
            rules={{required: t('required') as string}}
            defaultValue={DEFAULT_LANGUAGE}
            render={({field, fieldState: {error}}) => {
              return (
                <Select
                  label={t('default_email_language_housing_online_check_in')}
                  placeholder={t('select_language')}
                  options={LANGUAGE_OPTIONS}
                  disabled={disabled}
                  error={error?.message}
                  {...field}
                />
              );
            }}
          />
        </SelectWrapper>
        <OnlineSendingSettings
          ref={ref}
          type={EMAIL_SENDING_SETTINGS_TYPES.checkinOnline}
          sendingSettingsId={sendingSettingsId}
          settingsExist={Boolean(sendingSettingsId)}
          dispatch={dispatch}
          disabled={disabled}
        />
      </Section>
    );
  },
);

HousingOnlineCheckInSection.displayName = 'HousingOnlineCheckInSection';
HousingOnlineCheckInSection.defaultProps = defaultProps;
export {HousingOnlineCheckInSection};
