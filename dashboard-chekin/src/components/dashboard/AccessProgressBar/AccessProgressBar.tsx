import React from 'react';
import {useSpring, config} from 'react-spring';
import {useTranslation} from 'react-i18next';
import checkMarkIcon from '../../../assets/accept-icon-blue.svg';
import crossIcon from '../../../assets/close-icon-red.svg';
import type {LabelStatus} from './styled';
import {
  Wrapper,
  Bar,
  Progress,
  SendCheckinMark,
  GuestVerificationMark,
  SendKeyMark,
  GuestVerificationMarkLabel,
  SendCheckinMarkLabel,
  SendKeyMarkLabel,
  BREAKPOINTS,
  STATUSES,
} from './styled';

export type ProgressType = {
  sendCheckIn: LabelStatus;
  guestVerification: LabelStatus;
  sendKey: LabelStatus;
};

type AccessProgressBarProps = {
  progress: ProgressType;
};

function AccessProgressBar({progress}: AccessProgressBarProps) {
  const {t} = useTranslation();
  const [isSendCheckInReached, setIsSendCheckInReached] = React.useState(false);
  const [isGuestVerificationReached, setIsGuestVerificationReached] = React.useState(
    false,
  );
  const [isSendKeyReached, setIsSendKeyReached] = React.useState(false);

  const [progressPercentage, setProgressPercentage] = React.useState('0%');

  React.useEffect(() => {
    if (progress.sendKey !== STATUSES.idle) {
      setProgressPercentage(`${BREAKPOINTS.sendKey + BREAKPOINTS.offset}%`);
      return;
    } else {
      setProgressPercentage('0%');
    }

    if (progress.guestVerification !== STATUSES.idle) {
      setProgressPercentage(`${BREAKPOINTS.guestVerification + BREAKPOINTS.offset}%`);
      return;
    }

    if (progress.sendCheckIn !== STATUSES.idle) {
      setProgressPercentage(`${BREAKPOINTS.sendCheckIn + BREAKPOINTS.offset}%`);
    }
  }, [progress]);

  const spring = useSpring({
    value: progressPercentage,
    from: {
      value: '0%',
    },
    onFrame: ({value}: {value: string}) => {
      const currentProgress = Number(value?.replace(/%/, ''));

      const sendCheckInReached =
        progress.sendCheckIn !== STATUSES.idle &&
        currentProgress >= BREAKPOINTS.sendCheckIn - BREAKPOINTS.offset;
      setIsSendCheckInReached(sendCheckInReached);

      const guestVerificationReached =
        progress.guestVerification !== STATUSES.idle &&
        currentProgress >= BREAKPOINTS.guestVerification - BREAKPOINTS.offset;
      setIsGuestVerificationReached(guestVerificationReached);

      const sendKeyReached =
        progress.sendKey !== STATUSES.idle &&
        currentProgress >= BREAKPOINTS.sendKey - BREAKPOINTS.offset;
      setIsSendKeyReached(sendKeyReached);
    },
    config: config.molasses,
  });

  return (
    <Wrapper>
      <Bar>
        <Progress style={{width: (spring.value as unknown) as number}} />
        <>
          <SendCheckinMarkLabel
            status={isSendCheckInReached ? progress.sendCheckIn : STATUSES.idle}
          >
            {t('send_online_checkin')}
          </SendCheckinMarkLabel>
          <SendCheckinMark visible={isSendCheckInReached}>
            {progress.sendCheckIn === STATUSES.complete ? (
              <img src={checkMarkIcon} alt="Check mark" />
            ) : (
              <img src={crossIcon} alt="Cross mark" />
            )}
          </SendCheckinMark>
        </>
        <>
          <GuestVerificationMarkLabel
            status={
              isGuestVerificationReached ? progress.guestVerification : STATUSES.idle
            }
          >
            {t('guest_verification')}
          </GuestVerificationMarkLabel>
          <GuestVerificationMark visible={isGuestVerificationReached}>
            {progress.guestVerification === STATUSES.complete ? (
              <img src={checkMarkIcon} alt="Check mark" />
            ) : (
              <img src={crossIcon} alt="Cross mark" />
            )}
          </GuestVerificationMark>
        </>
        <>
          <SendKeyMarkLabel status={isSendKeyReached ? progress.sendKey : STATUSES.idle}>
            {t('send_key')}
          </SendKeyMarkLabel>
          <SendKeyMark visible={isSendKeyReached}>
            {progress.sendKey === STATUSES.complete ? (
              <img src={checkMarkIcon} alt="Check mark" />
            ) : (
              <img src={crossIcon} alt="Cross mark" />
            )}
          </SendKeyMark>
        </>
      </Bar>
    </Wrapper>
  );
}

export {AccessProgressBar};
