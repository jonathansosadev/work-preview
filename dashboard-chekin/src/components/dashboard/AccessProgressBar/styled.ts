import styled from 'styled-components';
import {animated} from 'react-spring';

const PROGRESS_MARK_SIZE = 37;
export const BREAKPOINTS = {
  sendCheckIn: 7,
  guestVerification: 50,
  sendKey: 98,
  offset: 2,
};

export const STATUSES = {
  complete: 'complete',
  error: 'error',
  idle: 'idle',
} as const;

export const LABEL_STATUSES_COLORS = {
  [STATUSES.complete]: '#385cf8',
  [STATUSES.error]: '#FF2467',
  [STATUSES.idle]: '#161643',
};

export type LabelStatus = typeof STATUSES[keyof typeof STATUSES];

type ProgressMarkProps = {
  visible: boolean;
};

const ProgressMark = styled.div<ProgressMarkProps>`
  background-color: white;
  box-shadow: 0 0 7px #2699fb29;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  user-select: none;
  transition: opacity 0.15s ease-in-out;
  width: ${PROGRESS_MARK_SIZE}px;
  height: ${PROGRESS_MARK_SIZE}px;
  top: -${PROGRESS_MARK_SIZE / 2 - 3}px;
  transform: translateX(-${PROGRESS_MARK_SIZE / 2}px);
  opacity: ${(props) => !props.visible && 0};
  animation: ${(props) => props.visible && 'bounce 0.5s ease-in-out forwards'};

  @keyframes bounce {
    0% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.1);
    }

    100% {
      transform: scale(1);
    }
  }
`;

type ProgressMarkLabelProps = {
  status: LabelStatus;
};

const ProgressMarkLabel = styled.div<ProgressMarkLabelProps>`
  position: absolute;
  text-align: center;
  white-space: nowrap;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  top: -45px;
  transform: translateX(-50%);
  transition: color 0.15s ease-in-out;
  color: ${(props) => LABEL_STATUSES_COLORS[props.status]};
`;

export const Wrapper = styled.div`
  max-width: 824px;
  width: 100%;
  display: flex;
  align-items: center;
  height: 100px;
`;

export const Bar = styled.div`
  width: 100%;
  background-color: #f2f9ff;
  height: 8px;
  border-radius: 100px;
  position: relative;
`;

export const Progress = styled(animated.div)`
  background-color: #385cf8;
  width: auto;
  height: 8px;
  border-radius: 100px;
`;

export const SendCheckinMark = styled(ProgressMark)<ProgressMarkProps>`
  left: ${BREAKPOINTS.sendCheckIn}%;
`;

export const GuestVerificationMark = styled(ProgressMark)<ProgressMarkProps>`
  left: ${BREAKPOINTS.guestVerification}%;
`;

export const SendKeyMark = styled(ProgressMark)<ProgressMarkProps>`
  left: ${BREAKPOINTS.sendKey}%;
`;

export const SendCheckinMarkLabel = styled(ProgressMarkLabel)<ProgressMarkLabelProps>`
  left: calc(${BREAKPOINTS.sendCheckIn}% + ${PROGRESS_MARK_SIZE / 2}px);
`;

export const GuestVerificationMarkLabel = styled(ProgressMarkLabel)<
  ProgressMarkLabelProps
>`
  left: calc(${BREAKPOINTS.guestVerification}% + ${PROGRESS_MARK_SIZE / 2}px);
`;

export const SendKeyMarkLabel = styled(ProgressMarkLabel)<ProgressMarkLabelProps>`
  left: calc(${BREAKPOINTS.sendKey}% + ${PROGRESS_MARK_SIZE / 2}px);
  transform: translateX(-50%);

  @media (max-width: 1120px) {
    transform: translateX(-100%);
  }
`;
