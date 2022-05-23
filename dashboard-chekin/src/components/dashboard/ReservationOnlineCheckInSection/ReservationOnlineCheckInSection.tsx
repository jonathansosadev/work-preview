import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import {LightReservation, SelectOption} from 'utils/types';
import {getRequiredOrOptionalFieldLabel} from 'utils/common';
import {useUser} from '../../../context/user';
import {useIsFormTouched} from 'utils/hooks';
import {
  PATTERNS,
  LANGUAGE_OPTIONS,
  EMAIL_SENDING_SETTINGS_TYPES,
} from '../../../utils/constants';
import Select from '../Select';
import {InputController} from '../Input';
import {ExtendedHousing, FormTypes, FORM_NAMES} from '../ReservationInfoSection';
import OnlineSendingSettings, {ACTION_TYPES} from '../OnlineSendingSettings';
import {
  Section,
  Content,
  PanelWrapper,
  FieldWrapper,
  SelectWrapper,
  SendCheckInOnlineButton,
  ShareOnlineCheckInContainer,
  ShareOnlineCheckinManuallyText,
  ShareOnlineCheckinManuallyWrapper,
  CopyButton,
} from './styled';

// const emailStatisticsRefetchIntervalS = 4;

// function fetchEmailStatistics(id: string) {
//   return queryFetcher(api.reservations.ENDPOINTS.emailStatistics(id));
// }

function getDefaultEmailLanguage(defaultEmailLanguage?: string) {
  if (!defaultEmailLanguage) {
    return LANGUAGE_OPTIONS[0];
  }

  const defaultLanguageOption = LANGUAGE_OPTIONS.filter(
    (l) => l.value === defaultEmailLanguage,
  );
  return defaultLanguageOption[0];
}

export const DEFAULT_LANGUAGE_FIELD_NAME = 'default_email_language';

const displayFields = {
  [FORM_NAMES.lead_guest_email]: true,
  [FORM_NAMES.language]: true,
};

const defaultValues = {
  [FORM_NAMES.lead_guest_email]: '',
  [FORM_NAMES.language]: LANGUAGE_OPTIONS[0],
};

type HousingOnlineCheckInSectionProps = {
  disabled: boolean;
  reservation?: LightReservation;
  isEditing?: boolean;
  setIsSectionTouched: (isTouched: boolean) => void;
  defaultLanguage?: string;
  extendedSelectedHousing?: ExtendedHousing;
  setIsSaveDisabled: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultProps: Partial<HousingOnlineCheckInSectionProps> = {
  disabled: false,
  isEditing: false,
  reservation: undefined,
  defaultLanguage: undefined,
};

const ReservationOnlineCheckInSection = React.forwardRef(
  (
    {
      disabled,
      reservation,
      isEditing,
      defaultLanguage,
      extendedSelectedHousing,
      dispatch,
      state,
    }: HousingOnlineCheckInSectionProps | any,
    ref,
  ) => {
    const {t} = useTranslation();
    const user = useUser();
    const {control, register, watch, setValue, trigger, formState} = useFormContext<
      FormTypes
    >();
    const {errors} = formState;

    const sendingSettingsId = React.useMemo(() => {
      const settingsId =
        reservation?.checkin_online_sending_settings_id ||
        extendedSelectedHousing?.checkin_online_sending_settings_id ||
        user?.checkin_online_sending_settings_id;

      return isEditing ? reservation && settingsId : settingsId;
    }, [
      extendedSelectedHousing?.checkin_online_sending_settings_id,
      isEditing,
      reservation,
      user?.checkin_online_sending_settings_id,
    ]);

    const {isSubmitted} = formState;

    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      watch,
      displayFields,
      defaultValues,
    });

    // const {
    //   data: emailStatistics,
    //   status: emailStatisticsStatus,
    //   error: emailStatisticsError,
    //   refetch: refetchEmailStatistics,
    // } = useQuery<EmailStatistics, [string, string]>(
    //   ['emailStatistics', reservation?.id],
    //   () => fetchEmailStatistics(reservation!.id),
    //   {
    //     enabled: Boolean(reservation?.id),
    //     refetchInterval: emailStatisticsRefetchIntervalS * 1000,
    //   },
    // );
    // useErrorToast(emailStatisticsError, {
    //   notFoundMessage: 'Email statistics could not be found. Please contact support.',
    // });

    const guestLeaderEmail = watch(FORM_NAMES.lead_guest_email) as string;
    const language = watch(FORM_NAMES.language) as SelectOption;
    const defaultEmailLanguage = defaultLanguage || reservation?.default_email_language;

    const isEmailFieldRequired = state.isActive && (t('required') as string);

    React.useEffect(() => {
      dispatch({type: ACTION_TYPES.touched, payload: isFormTouched});
    }, [isFormTouched, dispatch]);

    React.useEffect(() => {
      const defaultInviteEmail =
        reservation?.default_invite_email || defaultValues[FORM_NAMES.lead_guest_email];
      const defaultEmailLanguageOption = getDefaultEmailLanguage(defaultEmailLanguage);

      setUntouchedValues((prevState) => {
        return {
          ...prevState,
          [FORM_NAMES.lead_guest_email]: defaultInviteEmail,
          [FORM_NAMES.language]: defaultEmailLanguageOption,
        };
      });

      setValue(FORM_NAMES.lead_guest_email, defaultInviteEmail);
      setValue(FORM_NAMES.language, defaultEmailLanguageOption);
    }, [reservation, setValue, setUntouchedValues, defaultEmailLanguage]);

    React.useEffect(() => {
      if (isSubmitted) {
        trigger(FORM_NAMES.lead_guest_email);
      }
    }, [isSubmitted, trigger, isEmailFieldRequired]);

    const isSendingEmailEnabled =
      isEditing && guestLeaderEmail && PATTERNS.email.test(guestLeaderEmail);

    const getCheckinOnlineEmailPayload = () => {
      return {
        email_address: guestLeaderEmail,
        language: language?.value,
        reservation: reservation?.id,
      };
    };

    const getReservationEmailLanguage = () => {
      return {
        [DEFAULT_LANGUAGE_FIELD_NAME]: language?.value,
      };
    };

    return (
      <>
        <Section title={t('online_check_in')}>
          <Content>
            <PanelWrapper>
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.lead_guest_email, {
                    required: isEmailFieldRequired,
                    pattern: {
                      value: PATTERNS.email,
                      message: t('invalid_email'),
                    },
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    t('guest_leader_email'),
                    isEmailFieldRequired,
                  )}
                  placeholder={t('enter_email')}
                  disabled={disabled}
                  error={errors[FORM_NAMES.lead_guest_email]?.message}
                />
                <SelectWrapper>
                  <Controller
                    control={control}
                    name={FORM_NAMES.language}
                    rules={{required: t('required') as string}}
                    render={({field}) => {
                      return (
                        <Select
                          disabled={disabled}
                          error={(errors[FORM_NAMES.language] as any)?.message}
                          options={LANGUAGE_OPTIONS}
                          label={t('language')}
                          placeholder={t('select_language')}
                          {...field}
                        />
                      );
                    }}
                  />
                </SelectWrapper>
              </FieldWrapper>

              {isEditing && (
                <>
                  <ShareOnlineCheckInContainer>
                    {/* <SentEmailsContainer>
                      <SentEmailsTitle>{t('emails_already_sent')}</SentEmailsTitle>
                      <SentEmailsImage src={paperPlaneIcon} alt="Paper plane" />
                      <SentEmailsNumber>
                        {!reservation || emailStatisticsStatus === 'loading' ? (
                          <Loader />
                        ) : (
                          emailStatistics?.success || 0
                        )}
                      </SentEmailsNumber>
                    </SentEmailsContainer> */}
                    <ShareOnlineCheckinManuallyWrapper>
                      <ShareOnlineCheckinManuallyText>
                        {t('share_checkin_manually')}:
                      </ShareOnlineCheckinManuallyText>
                      <SendCheckInOnlineButton
                        disabled={disabled || !isSendingEmailEnabled}
                        label={t('send_online_check_in')}
                        getEmailPayload={getCheckinOnlineEmailPayload}
                        getLanguagePayload={getReservationEmailLanguage}
                        reservationId={reservation?.id}
                      />
                      <CopyButton
                        link={reservation?.signup_form_link}
                        isDisabled={disabled}
                      />
                    </ShareOnlineCheckinManuallyWrapper>
                  </ShareOnlineCheckInContainer>
                </>
              )}
            </PanelWrapper>
            <OnlineSendingSettings
              ref={ref}
              type={EMAIL_SENDING_SETTINGS_TYPES.checkinOnline}
              sendingSettingsId={sendingSettingsId}
              settingsExist={Boolean(reservation?.checkin_online_sending_settings_id)}
              dispatch={dispatch}
              disabled={disabled}
            />
          </Content>
        </Section>
      </>
    );
  },
);

ReservationOnlineCheckInSection.displayName = 'ReservationOnlineCheckInSection';
ReservationOnlineCheckInSection.defaultProps = defaultProps;

export {ReservationOnlineCheckInSection};
