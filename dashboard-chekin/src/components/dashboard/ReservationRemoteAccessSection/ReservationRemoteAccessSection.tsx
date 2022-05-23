import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import api, {queryFetcher} from '../../../api';
import {useErrorToast} from '../../../utils/hooks';
import {LightReservation, Lock, SelectOption, UnlockLink} from '../../../utils/types';
import {LOCK_TYPES_OPTIONS, LOCK_VENDORS, PATTERNS} from '../../../utils/constants';
import {
  copyToClipboard,
  downloadFromLink,
  // toastResponseError,
} from '../../../utils/common';
import {DEFAULT_LANGUAGE_FIELD_NAME} from '../ReservationOnlineCheckInSection/ReservationOnlineCheckInSection';
import {FORM_NAMES, FormTypes} from '../ReservationInfoSection';
import copyIcon from '../../../assets/copy-link-icon.svg';
// import keyStatus from '../../../assets/key-status.svg';
import keyIcon from '../../../assets/open-door-icon.svg';
import shareByEmail from '../../../assets/sharebyemail.svg';
import Section from '../Section';
import Loader from '../../common/Loader';
import {
  CopyButton,
  KeyDetails,
  KeyItemFooter,
  KeyItemWrapper,
  KeyName,
  KeyType,
  LoaderWrapper,
  OpenButton,
  SendEmailButtonStyled,
  Subtitle,
  KeyActions,
} from './styled';
import {FieldsGridLayout} from '../../../styled/common';

const copyTimeout = 1500;
const emailPayloadType = 'SMART_LOCK';
// const emailStatisticsRefetchIntervalS = 4;

function fetchLocks(reservationId: string) {
  return queryFetcher(
    api.locks.ENDPOINTS.locks(null, `unlock_links__reservation_id=${reservationId}`),
  );
}

// function fetchStatisticsLocks(reservationId: string) {
//   return queryFetcher(api.reservations.ENDPOINTS.emailStatisticsSmartLock(reservationId));
// }

type Unlock = Lock & {
  link: UnlockLink | null;
};

type ReservationRemoteAccessSectionProps = {
  unlockLinks: UnlockLink[];
  disabled: boolean;
  isEditing?: boolean;
  reservation?: LightReservation;
};

function ReservationRemoteAccessSection({
  reservation,
  unlockLinks,
  disabled,
  isEditing,
}: ReservationRemoteAccessSectionProps) {
  const {t} = useTranslation();
  // const isMounted = useIsMounted();
  const {watch} = useFormContext<FormTypes>();

  const guestLeaderEmail = watch(FORM_NAMES.lead_guest_email) as string;
  const language = watch(FORM_NAMES.language) as SelectOption;

  const isSendingEmailEnabled =
    isEditing && guestLeaderEmail && PATTERNS.email.test(guestLeaderEmail);

  const {data: locks, error: locksError, status: locksStatus} = useQuery<
    Lock[],
    [string, string]
  >(['locks', reservation?.id], () => fetchLocks(reservation!.id), {
    enabled: Boolean(reservation?.id),
  });
  useErrorToast(locksError, {
    notFoundMessage: 'Locks not found. Please contact support',
  });

  // const {
  //   data: statisticsLocksEmail,
  //   status: statisticsLocksEmailStatus,
  //   refetch: refetchStatisticsLocksEmail,
  // } = useQuery<{
  //   success: number;
  // }>(
  //   ['statisticsLocksEmail', reservation?.id],
  //   () => fetchStatisticsLocks(reservation!.id),
  //   {
  //     enabled: Boolean(reservation?.id),
  //     refetchInterval: emailStatisticsRefetchIntervalS * 1000,
  //     onError: (error) => {
  //       if (error && isMounted.current) {
  //         toastResponseError(error);
  //       }
  //     },
  //   },
  // );

  const getEmailPayload = () => {
    return {
      email_address: guestLeaderEmail,
      language: language?.value,
      reservation: reservation?.id,
      type: emailPayloadType,
    };
  };

  const getReservationEmailLanguage = () => {
    return {
      [DEFAULT_LANGUAGE_FIELD_NAME]: language?.value,
    };
  };

  const isLoading = locksStatus === 'loading';
  const unlocks: Unlock[] = React.useMemo(() => {
    if (!locks?.length) {
      return [];
    }

    return locks.map(
      (lock): Unlock => {
        const link = unlockLinks.find((link) => {
          return link.lock_id === lock.id;
        });

        return {
          ...lock,
          link: link || null,
        };
      },
    );
  }, [locks, unlockLinks]);

  return (
    <Section
      title={t('remote_access')}
      subtitle={
        <Subtitle>
          {!reservation /*|| statisticsLocksEmailStatus === 'loading'*/ ? (
            <Loader />
          ) : (
            <>
              {/* <img src={keyStatus} width={39} height={39} alt="" />
              {t('sent_locks_email_count', {number: statisticsLocksEmail?.success || 0})} */}
              <SendEmailButtonStyled
                status={'idle'}
                label={t('send_keys')}
                icon={shareByEmail}
                disabled={disabled || !isSendingEmailEnabled}
                getEmailPayload={getEmailPayload}
                getLanguagePayload={getReservationEmailLanguage}
                reservationId={reservation?.id}
              />{' '}
            </>
          )}
        </Subtitle>
      }
    >
      <FieldsGridLayout>
        {isLoading ? (
          <LoaderWrapper>
            <Loader height={45} width={45} label={t('loading')} />
          </LoaderWrapper>
        ) : (
          unlocks?.map((unlock) => {
            return <KeyItem key={unlock.id} unlock={unlock} />;
          })
        )}
      </FieldsGridLayout>
    </Section>
  );
}

type KeyRowProps = {
  unlock: Unlock;
};

function KeyItem({unlock}: KeyRowProps) {
  const {t} = useTranslation();
  const [isTextCopied, setIsTextCopied] = React.useState(false);
  const lockType =
    LOCK_TYPES_OPTIONS[unlock.type as keyof typeof LOCK_TYPES_OPTIONS]?.label || '';
  const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const name = unlock.name || '';

  const openLink = (link: string) => {
    downloadFromLink(link);
  };

  const copyTextToClipboard = (text: string) => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyToClipboard(text);

    setIsTextCopied(true);
    copyTimeoutRef.current = setTimeout(() => {
      setIsTextCopied(false);
    }, copyTimeout);
  };

  const unlockCode = unlock?.link?.collection_code || unlock?.link?.pass_code;

  if (unlockCode || unlock?.link?.unlock_link) {
    return (
      <KeyItemWrapper>
        <KeyName>{name}</KeyName>
        <KeyType>{lockType}</KeyType>

        {unlock?.link?.unlock_link && (
          <KeyActions>
            <OpenButton
              link
              onClick={() => openLink(unlock.link!.unlock_link)}
              icon={<img src={keyIcon} alt="Key" />}
              label={
                unlock?.vendor === LOCK_VENDORS.salto
                  ? t('send_keys_to_justin')
                  : t('open_door')
              }
            />

            <CopyButton
              link
              onClick={() => copyTextToClipboard(unlock.link!.unlock_link)}
              icon={<img src={copyIcon} alt="Signs" />}
              label={isTextCopied ? t('copied_exclamation') : t('copy_link')}
            />
          </KeyActions>
        )}

        {unlockCode ? (
          <KeyItemFooter>
            <KeyDetails>
              {t('code')}: {unlockCode}
            </KeyDetails>
            <CopyButton
              link
              onClick={() => copyTextToClipboard(unlockCode)}
              icon={<img src={copyIcon} alt="Signs" />}
              label={isTextCopied ? t('copied_exclamation') : t('copy_code')}
            />
          </KeyItemFooter>
        ) : null}
      </KeyItemWrapper>
    );
  }

  return (
    <KeyItemWrapper>
      <KeyName>{name}: </KeyName>
      <KeyDetails>{t('details_missing')}</KeyDetails>
    </KeyItemWrapper>
  );
}

export {ReservationRemoteAccessSection};
