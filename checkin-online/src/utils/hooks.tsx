import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {getErrorMessage} from './common';
import userErrorIcon from '../assets/user-error.svg';
import Modal from '../components/Modal';
import {ModalButton} from '../styled/common';
import {LocationTypes} from '../hooks/useReservationPayload';
import {device} from '../styled/device';
import {resolver, ResolverTypes} from '../api';
import {PATHS} from '../Routes';
const BASE_URL = process.env.REACT_APP_BASE_URL;
const LOCAL_STORAGE_REDIRECT_KEY = 'ALREADY_REDIRECT';
const PROPERTY_LINK_URL = 'PROPERTY_LINK_URL';

const ModalContent = styled.div`
  max-width: 350px;
  padding: 0 20px;
  margin: 10px auto 30px;

  span {
    font-family: ProximaNova-Light, sans-serif;
    color: #161643;
    font-size: 18px;
    text-align: center;
  }

  @media (max-width: ${device.mobileL}) {
    max-width: 240px;
  }
`;

function usePrevious<T>(value: any) {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function useIsMounted() {
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return isMounted;
}

type ErrorModalProps = {
  onClose?: () => void;
  open?: boolean;
  message?: string;
  description?: React.ReactNode | JSX.Element | string;
  children?: React.ReactNode | JSX.Element | string | null;
  iconSrc?: string;
  iconAlt?: string;
  title?: React.ReactNode | JSX.Element | string;
};

function useErrorModal() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);
  const [isNeedTranslate, setIsNeedTranslate] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const translatedErrorMessage = isNeedTranslate ? t(errorMessage) : errorMessage;

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const openErrorModal = () => {
    setIsErrorModalOpen(true);
  };

  const displayError = React.useCallback(
    (error: any = {}, isNeedTranslate = false) => {
      if (!isMounted.current) {
        return;
      }

      const message = getErrorMessage(error);
      setErrorMessage(message);
      if (isNeedTranslate) setIsNeedTranslate(isNeedTranslate);
      setIsErrorModalOpen(true);
    },
    [isMounted],
  );

  const ErrorModal = ({
    open,
    onClose,
    message,
    description,
    children,
    iconSrc,
    iconAlt,
    title,
  }: ErrorModalProps) => (
    <Modal
      open={open !== undefined ? open : isErrorModalOpen}
      title={title || t('error_sad_face')}
      iconSrc={iconSrc || userErrorIcon}
      iconAlt={iconAlt || 'Exclamation error mark'}
    >
      <ModalContent>
        {message || translatedErrorMessage ? (
          <>
            {message ? (
              <span>
                {message}
                <p />
                {description || ''}
              </span>
            ) : (
              <span>
                {translatedErrorMessage}
                <p />
                {t('try_again_or_contact')}
              </span>
            )}
          </>
        ) : (
          <span>
            {t('we_found_error')}
            <p />
            {t('try_again_or_contact')}
          </span>
        )}
      </ModalContent>
      {children || <ModalButton label={t('ok')} onClick={onClose || closeErrorModal} />}
    </Modal>
  );

  return {
    displayError,
    closeErrorModal,
    openErrorModal,
    ErrorModal,
  };
}

function useModalControls(initState = false) {
  const [isOpen, setIsOpen] = React.useState(initState);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    setIsOpen,
  };
}

function useAbortController() {
  const [abortController, setAbortController] = React.useState(() => {
    return new AbortController();
  });

  const setupAbortController = React.useCallback(() => {
    const abortController = new AbortController();
    setAbortController(abortController);

    return abortController.signal;
  }, []);

  return {
    abortController,
    setupAbortController,
  };
}

function useOutsideClick(
  elementRef: React.RefObject<any>,
  onOutsideClick: (event: any) => void,
) {
  const handleOutsideClick = React.useRef(onOutsideClick);
  handleOutsideClick.current = onOutsideClick;

  React.useEffect(() => {
    function handleClickOutside(event: Event) {
      if (elementRef.current && !elementRef.current.contains(event.target)) {
        handleOutsideClick.current(event);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [elementRef]);
}

type Status = 'loading' | 'error' | 'success' | 'idle';
type StatusProps = {
  initStatus?: Status;
  statusTimeout?: number;
  autoReset?: boolean;
};
function useStatus({
  initStatus = 'idle',
  statusTimeout = 1500,
  autoReset = false,
}: StatusProps = {}) {
  const [status, setStatus] = React.useState<Status>(initStatus);
  const timeoutRef = React.useRef<number>();
  const isLoading = status === 'loading';
  const isIdle = status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const resetStatus = React.useCallback(() => {
    setStatus('idle');
  }, []);

  const resetStatusAfterTimeout = React.useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      resetStatus();
    }, [statusTimeout]);
  }, [resetStatus, statusTimeout]);

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!isIdle && autoReset && !isLoading) {
      resetStatusAfterTimeout();
    }
  }, [autoReset, isIdle, isLoading, resetStatusAfterTimeout, status]);

  return {
    status,
    setStatus,
    isLoading,
    resetStatus,
    isIdle,
    isSuccess,
    isError,
    resetStatusAfterTimeout,
  };
}

function useGoBackTo(url = '/form/add') {
  const history = useHistory();
  const location = useLocation<LocationTypes>();
  const isRetryBiomatch = location.state?.isRetryBiomatch;

  const goBack = React.useCallback(() => {
    const backUrl = isRetryBiomatch ? '/biomatch-results' : url;
    history.push(backUrl, location.state);
  }, [history, isRetryBiomatch, location.state, url]);

  React.useEffect(() => {
    const hasRequiredPreviousData = location.state?.formData;
    const isAllowGoBack = !isRetryBiomatch;
    if (!hasRequiredPreviousData && isAllowGoBack) {
      goBack();
    }
  }, [goBack, isRetryBiomatch, location.state]);

  return {goBack};
}

function useRedirectAfterIdle() {
  const {pathname, state} = useLocation();
  const timeIdRef = React.useRef<number | null>(null);
  const [redirectTime, setRedirectTime] = React.useState(90000);
  const goBackToHome = React.useCallback(() => {
    const redirectUrl = localStorage.getItem(PROPERTY_LINK_URL);
    if (redirectUrl) {
      localStorage.removeItem(PROPERTY_LINK_URL);
      localStorage.removeItem(LOCAL_STORAGE_REDIRECT_KEY);
      window.location.href = redirectUrl;
    }
  }, []);

  const restartAutoReset = React.useCallback(() => {
    if (timeIdRef.current) {
      clearTimeout(timeIdRef.current);
    }
    timeIdRef.current = setTimeout(() => {
      goBackToHome();
    }, [redirectTime]);
  }, [redirectTime, goBackToHome]);

  const onMouseMOveOrTyped = React.useCallback(() => {
    restartAutoReset();
  }, [restartAutoReset]);

  const whitelist = [PATHS.searchReservation];

  const redirect = React.useCallback(() => {
    switch (pathname) {
      case '/finish':
        setRedirectTime(30000);
        break;
      case PATHS.payments:
      case '/deposits/payment':
        setRedirectTime(180000);
        break;
      default:
        setRedirectTime(90000);
        break;
    }

    let preventReset = false;
    for (const path of whitelist) {
      if (path === pathname) {
        preventReset = true;
      }
    }
    if (preventReset) {
      return;
    }

    restartAutoReset();

    window.addEventListener('mousemove', onMouseMOveOrTyped);
    window.addEventListener('keydown', onMouseMOveOrTyped);

    return () => {
      if (timeIdRef.current) {
        clearTimeout(timeIdRef.current);
        window.removeEventListener('mousemove', onMouseMOveOrTyped);
        window.removeEventListener('keydown', onMouseMOveOrTyped);
      }
    };
  }, [pathname, restartAutoReset, onMouseMOveOrTyped, whitelist]);

  const getIsSecondCounterApplied = (shortHousingId: string): Promise<ResolverTypes> => {
    return resolver(`housings/${shortHousingId}/`, {
      method: 'GET',
    });
  };

  const triggerRedirect = React.useCallback(
    async shortHousingId => {
      const getAlreadyRedirect = localStorage.getItem(LOCAL_STORAGE_REDIRECT_KEY);
      const isSecondsCoutnerApplied = localStorage.getItem('IS_SECONDS_COUNTER_APPLIED');

      if (
        getAlreadyRedirect === 'SETTED' &&
        isSecondsCoutnerApplied === 'true' &&
        pathname !== PATHS.searchReservation
      ) {
        if (pathname === '/' && !state?.fromHousingFlow) {
          return;
        }
        redirect();
      }

      if (pathname === '/search-reservation') {
        const url = `${BASE_URL}/L/${state.l}`;
        const {data: housing} = await getIsSecondCounterApplied(shortHousingId);
        localStorage.setItem(
          'IS_SECONDS_COUNTER_APPLIED',
          housing.is_seconds_counter_applied,
        );
        localStorage.setItem(PROPERTY_LINK_URL, url);
        localStorage.setItem(LOCAL_STORAGE_REDIRECT_KEY, 'SETTED');
      }
    },
    [pathname, redirect, state],
  );

  return triggerRedirect;
}

const eventName = 'resize';
function useScreenResize(maxWidth: string) {
  const [isMatch, setIsMatch] = React.useState(false);

  const handleResizeEvent = React.useCallback(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth})`);
    setIsMatch(media.matches);
  }, [maxWidth]);

  React.useEffect(() => {
    handleResizeEvent();
    window.addEventListener(eventName, handleResizeEvent);
    return () => {
      window.removeEventListener(eventName, handleResizeEvent);
    };
  }, [handleResizeEvent]);

  return {isMatch};
}

export {
  useStatus,
  usePrevious,
  useIsMounted,
  useErrorModal,
  useModalControls,
  useAbortController,
  useOutsideClick,
  useGoBackTo,
  useRedirectAfterIdle,
  useScreenResize,
};
