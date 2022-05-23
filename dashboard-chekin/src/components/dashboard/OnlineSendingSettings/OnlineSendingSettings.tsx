import React from 'react';
import {useQuery, useMutation, useQueryClient} from 'react-query';
import {useForm, FormProvider} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import api from 'api';
import {EMAIL_SENDING_SETTINGS_TYPES} from '../../../utils/constants';
import {toastResponseError2} from 'utils/common';
import {useErrorToast} from 'utils/hooks';
import Loader from '../../common/Loader';
import Selectors from '../Selectors';
import Switch, {useSwitchSectionActive} from '../Switch';

export const EMAIL_SENDING_SETTINGS_QUERY_KEY = 'onlineSendingSettings';

enum EMAIL_SENDING_SETTINGS_OPTIONS {
  is_sending_after_reservation_created_enabled = 'is_sending_after_reservation_created_enabled',
  is_sending_one_week_before_check_in_enabled = 'is_sending_one_week_before_check_in_enabled',
  is_sending_72_hours_before_check_in_enabled = 'is_sending_72_hours_before_check_in_enabled',
  is_sending_48_hours_before_check_in_enabled = 'is_sending_48_hours_before_check_in_enabled',
  is_sending_24_hours_before_check_in_enabled = 'is_sending_24_hours_before_check_in_enabled',
}

const emailSendingOptionsDefault = {
  is_sending_after_reservation_created_enabled: true,
};

enum EMAIL_SENDING_SETTINGS_SWITCH {
  is_sending_enabled = 'is_sending_enabled',
}

export type CheckinOnlineSendingSettingsPayload = {
  [key in EMAIL_SENDING_SETTINGS_OPTIONS]: boolean;
} & {[EMAIL_SENDING_SETTINGS_SWITCH.is_sending_enabled]: boolean};

export type CheckinOnlineSendingSettings = CheckinOnlineSendingSettingsPayload & {
  id: string | null;
};

type FormTypes = {
  [key in EMAIL_SENDING_SETTINGS_OPTIONS]: boolean;
} & {[EMAIL_SENDING_SETTINGS_SWITCH.is_sending_enabled]: boolean};

type ReducerState = {
  isTouched: boolean;
  isDisabled: boolean;
  isLoading: boolean;
};

export enum ACTION_TYPES {
  loading,
  disabled,
  touched,
  active,
}

type ActionType = {
  type: ACTION_TYPES;
  payload: boolean;
};

export type SubmitOnlineCheckinProps = {
  reservation?: string;
  housing?: string;
};

type OnlineSendingSettingsRef = {
  submitOnlineCheckin: (
    extraFields?: SubmitOnlineCheckinProps,
  ) => Promise<{id: string; error?: Error}>;
};

export function useSendingSettingsRef() {
  return React.useRef<OnlineSendingSettingsRef>(null);
}

export const initialState = {
  isTouched: false,
  isDisabled: false,
  isLoading: false,
};

export const reducer = (state: ReducerState, action: ActionType) => {
  switch (action.type) {
    case ACTION_TYPES.loading:
      return {...state, isLoading: action.payload};
    case ACTION_TYPES.disabled:
      return {...state, isDisabled: action.payload};
    case ACTION_TYPES.touched:
      return {...state, isTouched: action.payload};
    case ACTION_TYPES.active:
      return {...state, isActive: action.payload};
    default:
      return state;
  }
};

type OnlineSendingSettingsProps = {
  settingsExist: boolean;
  type: EMAIL_SENDING_SETTINGS_TYPES;
  dispatch: React.Dispatch<ActionType>;
  disabled: boolean;
  sendingSettingsId?: string | null;
};

const OnlineSendingSettings = React.forwardRef<unknown, OnlineSendingSettingsProps>(
  ({sendingSettingsId, settingsExist, dispatch, type, disabled}, ref) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const formMethods = useForm<FormTypes>();
    const {setValue, register, getValues} = formMethods;
    const {
      data: onlineSendingSettings,
      error: onlineSendingSettingsError,
      isLoading: isQueryLoading,
    } = useQuery<CheckinOnlineSendingSettings, [string, string]>(
      [EMAIL_SENDING_SETTINGS_QUERY_KEY, sendingSettingsId],
      () => api.emailSendingSettings.get(sendingSettingsId!),
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: Boolean(sendingSettingsId),
      },
    );
    useErrorToast(onlineSendingSettingsError, {
      notFoundMessage:
        'Online sending settings could not be found. Please contact support.',
    });
    const {mutateAsync, isLoading: isMutationLoading} = useMutation(
      EMAIL_SENDING_SETTINGS_QUERY_KEY,
      (payload: CheckinOnlineSendingSettingsPayload): Promise<{id: string}> =>
        settingsExist && sendingSettingsId
          ? api.emailSendingSettings.patch(sendingSettingsId, payload)
          : api.emailSendingSettings.post(payload),
      {
        onMutate: (data) => {
          if (sendingSettingsId) {
            const oldSettings = queryClient.getQueryData([
              EMAIL_SENDING_SETTINGS_QUERY_KEY,
              sendingSettingsId,
            ]);

            queryClient.setQueryData(
              [EMAIL_SENDING_SETTINGS_QUERY_KEY, sendingSettingsId],
              data,
            );

            return () => {
              queryClient.setQueryData(
                [EMAIL_SENDING_SETTINGS_QUERY_KEY, sendingSettingsId],
                oldSettings,
              );
            };
          }
        },
        onError: (error, _, rollback) => {
          if (typeof rollback === 'function') rollback();

          toastResponseError2(error);
        },
        onSettled: () => {
          if (onlineSendingSettings?.id) {
            queryClient.invalidateQueries([
              EMAIL_SENDING_SETTINGS_QUERY_KEY,
              sendingSettingsId,
            ]);
          }
        },
      },
    );
    const defaultValue = sendingSettingsId ? undefined : emailSendingOptionsDefault;
    const isLoading = !sendingSettingsId && isMutationLoading;
    const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);
    const [isAnySelectorActive, setIsAnySelectorActive] = React.useState(false);

    const isSendingEnabled = onlineSendingSettings?.is_sending_enabled;

    const {
      isSectionActive,
      toggleIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(isSendingEnabled);

    const getBuildPayload = (extraFields?: SubmitOnlineCheckinProps) => {
      return {
        ...getValues(),
        ...extraFields,
        type,
      };
    };

    const onSubmit = async (extraFields?: SubmitOnlineCheckinProps) => {
      const formData = getBuildPayload(extraFields);
      return await mutateAsync(formData);
    };

    React.useImperativeHandle(ref, () => {
      return {
        submitOnlineCheckin: onSubmit,
      };
    });

    React.useEffect(
      function registerSwitchToForm() {
        register(EMAIL_SENDING_SETTINGS_SWITCH.is_sending_enabled);
      },
      [register],
    );

    React.useEffect(
      function handleSectionActive() {
        setValue(EMAIL_SENDING_SETTINGS_SWITCH.is_sending_enabled, isSectionActive);
      },
      [isSectionActive, setValue],
    );

    React.useEffect(
      function handleSectionTouched() {
        dispatch({
          type: ACTION_TYPES.touched,
          payload: isSelectorsTouched || isSectionActiveTouched,
        });
      },
      [isSectionActiveTouched, isSelectorsTouched, dispatch],
    );

    React.useEffect(
      function handleSaveDisabled() {
        dispatch({
          type: ACTION_TYPES.disabled,
          payload: !isAnySelectorActive && isSectionActive,
        });
      },
      [isAnySelectorActive, isSectionActive, dispatch],
    );

    React.useEffect(
      function handleLoading() {
        dispatch({type: ACTION_TYPES.loading, payload: isLoading});
      },
      [isLoading, sendingSettingsId, dispatch],
    );

    React.useEffect(
      function handleActive() {
        dispatch({type: ACTION_TYPES.active, payload: isSectionActive});
      },
      [isSectionActive, dispatch],
    );

    return isQueryLoading ? (
      <Loader height={40} width={40} />
    ) : (
      <div>
        <Switch
          checked={isSectionActive}
          onChange={toggleIsSectionActive}
          label={t('send_check_in')}
          disabled={isLoading}
        />
        {isSectionActive && (
          <FormProvider {...formMethods}>
            <Selectors
              disabled={isLoading || disabled}
              selectorsFormNames={EMAIL_SENDING_SETTINGS_OPTIONS}
              defaultFormValues={defaultValue}
              preloadedSelectorsData={onlineSendingSettings}
              isSectionActive={isSectionActive}
              setIsSelectorsTouched={setIsSelectorsTouched}
              setIsAnySelectorActive={setIsAnySelectorActive}
            />
          </FormProvider>
        )}
      </div>
    );
  },
);

OnlineSendingSettings.displayName = 'OnlineSendingSettings';

export {OnlineSendingSettings};
