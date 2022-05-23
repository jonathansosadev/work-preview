import React from 'react';
import {useMutation} from 'react-query';
import {useTranslation} from 'react-i18next';
import {EMAIL_SENDING_SETTINGS_TYPES} from '../../../utils/constants';
import {useUser} from 'context/user';
import {useAuth} from '../../../context/auth';
import api from 'api';
import Section from '../Section';
import FloppyIconFilling from '../FloppyIconFilling';
import CustomFormsHub from '../CustomFormsHub';
import OnlineSendingSettings, {
  initialState,
  reducer,
  useSendingSettingsRef,
} from '../OnlineSendingSettings';
import {HeaderWrapper, SaveButton} from './styled';

function OnlineCheckinSection() {
  const {t} = useTranslation();
  const userContext = useUser();
  const {refreshAccount, isLoading: isRefreshAcc} = useAuth();
  const {
    mutate,
    isLoading: isPatchingUser,
  } = useMutation((data: {checkin_online_sending_settings_id: string}) =>
    api.users.patchMe(data),
  );
  const sendingSettingsId = userContext?.checkin_online_sending_settings_id;
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const {isTouched, isDisabled, isLoading: isSavingSettings} = state;
  const sendingSettingsRef = useSendingSettingsRef();
  const isLoading = isPatchingUser || isSavingSettings || isRefreshAcc;

  const onSubmit = async () => {
    const res = await sendingSettingsRef.current?.submitOnlineCheckin();

    if (!sendingSettingsId && res) {
      mutate(
        {checkin_online_sending_settings_id: res.id},
        {
          onSuccess: () => {
            refreshAccount();
          },
        },
      );
    }
  };

  return (
    <>
      <Section
        title={
          <HeaderWrapper>
            {t('online_check_in')}
            {/* <HowItWorksLink /> */}
          </HeaderWrapper>
        }
        subtitle={t('online_checkin_will_be_sent_automatically')}
      >
        <OnlineSendingSettings
          ref={sendingSettingsRef}
          type={EMAIL_SENDING_SETTINGS_TYPES.checkinOnline}
          sendingSettingsId={sendingSettingsId}
          settingsExist={Boolean(sendingSettingsId)}
          dispatch={dispatch}
          disabled={isLoading}
        />
        {!isDisabled && isTouched && (
          <SaveButton
            label={
              <FloppyIconFilling label={isLoading ? `${t('saving')}...` : t('save')} />
            }
            onClick={onSubmit}
            disabled={isLoading}
          />
        )}
      </Section>
      <CustomFormsHub />
    </>
  );
}

export {OnlineCheckinSection};
