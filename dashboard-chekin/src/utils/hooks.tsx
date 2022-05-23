import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import {ResolverTypes} from '../api';
import {getErrorMessage, scrollToTop, toastResponseError} from './common';
import {Status, SelectOption, ReactEntity} from './types';
import {useComputedDetails} from '../context/computedDetails';
import {openHubspotChat} from '../analytics/hubspot';
import errorIcon from '../assets/error-icon.svg';
import warningIcon from '../assets/warning-icon.svg';
import checkIcon from '../assets/check-green.svg';
import ModalButton from '../components/dashboard/ModalButton';
import Modal from '../components/dashboard/Modal';
import SubscriptionAskModalComponent from '../components/dashboard/SubscriptionAskModal';
import {SubscriptionAskModalProps} from '../components/dashboard/SubscriptionAskModal/SubscriptionAskModal';
import {ModalTwoButtonsWrapper} from '../styled/common';


function useCompare<T> (val:any):boolean {
  const prevVal = usePrevious<T>(val)
  return prevVal !== val
}

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

function useOutsideClick(
  elementRef: React.RefObject<any>,
  onOutsideClick: (event: React.MouseEvent) => void,
) {
  const handleOutsideClick = React.useRef(onOutsideClick);
  handleOutsideClick.current = onOutsideClick;

  React.useEffect(() => {
    function handleClickOutside(event: any) {
      event.stopPropagation();
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

type useErrorToastOptions = {
  notFoundMessage?: string;
};

function useErrorToast(error: any, options?: useErrorToastOptions) {
  const notFoundMessage = options?.notFoundMessage;

  React.useEffect(() => {
    if (error) {
      if (error?.body?.status_code === 404 && notFoundMessage) {
        error.message = notFoundMessage;
      }

      toastResponseError(error);
    }
  }, [error, notFoundMessage]);
}

function useScrollToTop() {
  React.useEffect(() => {
    scrollToTop();
  }, []);
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
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
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
    }, statusTimeout);
  }, [resetStatus, statusTimeout]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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
    isIdle,
    isSuccess,
    isError,
    resetStatus,
  };
}

const ContactSupportButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 11px;
  position: absolute;
  top: 15px;
  right: 10px;
  text-align: right;
  text-transform: uppercase;
  color: rgb(150, 150, 185);

  &:hover {
    color: rgb(26, 140, 255);
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

const ErrorButton = styled(ModalButton)`
  margin-bottom: 30px;
`;

export type ErrorModalProps = {
  onClose?: () => void;
  open?: boolean;
  message?: ReactEntity;
  children?: ReactEntity | null;
  iconSrc?: string;
  iconAlt?: string;
  title?: string;
  contentStyle?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  iconProps?: any;
};

function useErrorModal() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const closeErrorModal = React.useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  const openErrorModal = React.useCallback(() => {
    setIsErrorModalOpen(true);
  }, []);

  const displayError = React.useCallback(
    (error: any = {}) => {
      if (!isMounted.current) {
        return;
      }

      const message = getErrorMessage(error);
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    },
    [isMounted],
  );

  const ErrorModal = ({
    open,
    onClose,
    message,
    children,
    iconSrc,
    iconAlt,
    title,
    iconProps,
  }: ErrorModalProps) => (
    <Modal
      open={open !== undefined ? open : isErrorModalOpen}
      title={title || t('error_sad_face')}
      text={
        message || errorMessage ? (
          <span>
            {errorMessage || message}
            <p />
            {t('try_again_or_contact')}
          </span>
        ) : (
          <span>
            {t('we_found_error')}
            <p />
            {t('try_again_or_contact')}
          </span>
        )
      }
      iconSrc={iconSrc || errorIcon}
      iconAlt={iconAlt || 'Exclamation error mark'}
      iconProps={iconProps || {width: 84, height: 84}}
    >
      <ContactSupportButton onClick={openHubspotChat}>
        {t('contact_support')}
      </ContactSupportButton>
      {children || <ErrorButton label={t('ok')} onClick={onClose || closeErrorModal} />}
    </Modal>
  );

  return {
    isErrorModalOpen,
    displayError,
    closeErrorModal,
    openErrorModal,
    ErrorModal,
  };
}

function useSubscriptionAskModal() {
  const {isNeedToAskForSubscription} = useComputedDetails();
  const {openModal, closeModal, isOpen, setIsOpen} = useModalControls();

  const tryToAskSubscription = React.useCallback(() => {
    if (isNeedToAskForSubscription) {
      openModal();
      return true;
    }

    return false;
  }, [isNeedToAskForSubscription, openModal]);

  const SubscriptionAskModal = ({open, onClose}: SubscriptionAskModalProps) => {
    return (
      <SubscriptionAskModalComponent
        onClose={onClose || closeModal}
        open={open || isOpen}
      />
    );
  };

  return {openModal, closeModal, setIsOpen, SubscriptionAskModal, tryToAskSubscription};
}

function useWarningModal() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const [isWarningModalOpen, setIsWarningModalOpen] = React.useState(false);
  const [warningMessage, setWarningMessage] = React.useState<ReactEntity>('');

  const closeWarningModal = React.useCallback(() => {
    setIsWarningModalOpen(false);
  }, []);

  const openWarningModal = React.useCallback(() => {
    setIsWarningModalOpen(true);
  }, []);

  const displayWarning = React.useCallback(
    (message: ReactEntity) => {
      if (!isMounted.current) {
        return;
      }
      setWarningMessage(message);
      setIsWarningModalOpen(true);
    },
    [isMounted],
  );

  const WarningModal = ({
    open,
    onClose,
    message,
    children,
    iconSrc,
    iconAlt,
    title,
    contentStyle,
    overlayStyle,
    iconProps,
  }: ErrorModalProps) => (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open !== undefined ? open : isWarningModalOpen}
      title={title || t('welcome_to_chekin')}
      text={message || warningMessage}
      iconSrc={iconSrc || warningIcon}
      iconAlt={iconAlt || 'Warning mark'}
      iconProps={iconProps || {width: 84, height: 84}}
      overlayStyle={overlayStyle}
      contentStyle={contentStyle}
    >
      {children || (
        <ModalTwoButtonsWrapper>
          <ModalButton label={t('contact_support')} onClick={openHubspotChat} />
          <ErrorButton
            secondary
            label={t('cancel')}
            onClick={onClose || closeWarningModal}
          />
        </ModalTwoButtonsWrapper>
      )}
    </Modal>
  );

  return {
    isWarningModalOpen,
    displayWarning,
    closeWarningModal,
    openWarningModal,
    WarningModal,
  };
}

export const SuccessModalButtonWrapper = styled.div`
  padding-bottom: 40px;
  margin-top: 60px;
`;

function useSuccessModal(initState = false) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = React.useState(initState);
  const [successMessage, setSuccessMessage] = React.useState<ReactEntity>('');

  const closeSuccessModal = React.useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  const openSuccessModal = React.useCallback(() => {
    setIsSuccessModalOpen(true);
  }, []);

  const displaySuccess = React.useCallback(
    (message: ReactEntity) => {
      if (!isMounted.current) {
        return;
      }
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    },
    [isMounted],
  );

  const SuccessModal = ({
    open,
    onClose,
    message,
    children,
    iconSrc,
    iconAlt,
    title,
    contentStyle,
    overlayStyle,
    iconProps,
  }: ErrorModalProps) => (
    <Modal
      closeOnEscape
      closeOnDocumentClick
      onClose={onClose || closeSuccessModal}
      open={open !== undefined ? open : isSuccessModalOpen}
      contentStyle={contentStyle}
      overlayStyle={overlayStyle}
      iconSrc={iconSrc || checkIcon}
      iconAlt={iconAlt || 'Green checkmark'}
      iconProps={iconProps || {height: 84, width: 84}}
      title={title || t('success_exclamation')}
      text={message || successMessage}
    >
      {children}
      <SuccessModalButtonWrapper>
        <ModalButton label={t('ok')} onClick={onClose || closeSuccessModal} />
      </SuccessModalButtonWrapper>
    </Modal>
  );

  return {
    isSuccessModalOpen,
    closeSuccessModal,
    openSuccessModal,
    displaySuccess,
    SuccessModal,
  };
}

type UseCorrectSelectionProps = {
  array: SelectOption[];
  option: SelectOption;
  handler: (option: SelectOption) => any;
  defaultOption?: SelectOption;
};

function useCorrectOptionSelection({
  array,
  option,
  handler,
  defaultOption,
}: UseCorrectSelectionProps) {
  React.useEffect(() => {
    if (array?.length) {
      const isSelectionCorrect = array.find((o) => o.value === option.value);

      if (!isSelectionCorrect) {
        const arrayOption = array[0];

        if (arrayOption) {
          handler(array[0]);
          return;
        }
      }
    }
  }, [option.value, array, handler, defaultOption]);

  React.useEffect(() => {
    if (!array?.length && defaultOption && option?.value !== defaultOption?.value) {
      handler(defaultOption);
    }
  }, [array, defaultOption, handler, option]);
}

type useIsFormUntouchedTypes = {
  watch: any;
  displayFields: {[key: string]: boolean};
  debug?: boolean;
  defaultValues?: {[key: string]: any};
};

function useIsFormTouched({
  watch,
  displayFields,
  debug,
  defaultValues,
}: useIsFormUntouchedTypes) {
  const [untouchedValues, setUntouchedValues] = React.useState<{
    [key: string]: any;
  }>(defaultValues || {});

  const getIsFormTouched = () => {
    if (!Object.keys(untouchedValues)) {
      return false;
    }

    return Object.keys(untouchedValues).some((field) => {
      if (!displayFields[field] || watch(field) === undefined) {
        return false;
      }

      if (watch(field)?.value && untouchedValues[field]?.value) {
        if (debug) {
          console.log({
            res: untouchedValues[field]?.value !== watch(field)?.value,
            [field]: {form: watch(field), untouched: untouchedValues[field]},
          });
        }
        return untouchedValues[field]?.value !== watch(field)?.value;
      }

      if (watch(field) instanceof Date || watch(field) instanceof moment) {
        if (debug) {
          console.log({
            res: !moment(untouchedValues[field]).isSame(watch(field), 'day'),
            [field]: {form: watch(field), untouched: untouchedValues[field]},
          });
        }
        return !moment(untouchedValues[field]).isSame(watch(field), 'day');
      }

      if (debug) {
        console.log({
          res: untouchedValues[field] !== watch(field),
          [field]: {form: watch(field), untouched: untouchedValues[field]},
        });
      }
      return untouchedValues[field] !== watch(field);
    });
  };

  return {
    setUntouchedValues,
    isFormTouched: getIsFormTouched(),
  };
}

function useDebounce<ValueType = string>(value: ValueType, delayMs = 1000) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delayMs);

      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delayMs], // Only re-call effect if value or delay changes
  );

  return debouncedValue;
}

function useAsyncOperation(statusParams?: StatusProps) {
  const isMounted = useIsMounted();
  const {status, isLoading, setStatus} = useStatus(statusParams);

  const asyncOperation = React.useCallback(
    async <T extends unknown = any>(
      operation: () => Promise<ResolverTypes<T>>,
      {
        onSuccess,
        onError,
      }: {
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
      } = {},
    ) => {
      setStatus('loading');

      const {data, error} = await operation();

      if (!isMounted.current) return;

      if (data) {
        setStatus('success');

        if (onSuccess) {
          onSuccess(data);
        }
      }

      if (error) {
        setStatus('error');

        if (onError) {
          onError(error);
        }
      }

      return {data, error};
    },
    [isMounted, setStatus],
  );

  return {
    asyncOperation,
    isLoading,
    status,
  };
}

type UseIsSelectorsSectionSaveAvailable = {
  isSectionActive: boolean;
  isSectionActiveTouched: boolean;
  isAnySelectorActive: boolean;
  isAnySelectorTouched: boolean;
};

function useIsSelectorsSectionSaveAvailable({
  isSectionActive,
  isSectionActiveTouched,
  isAnySelectorActive,
  isAnySelectorTouched,
}: UseIsSelectorsSectionSaveAvailable) {
  const [isSaveAvailable, setIsSaveAvailable] = React.useState(false);

  React.useLayoutEffect(
    function handleIsSaveAvailable() {
      const isAnyChanges =
        (isSectionActiveTouched && isSectionActive && isAnySelectorActive) ||
        (isSectionActive && isAnySelectorTouched && isAnySelectorActive) ||
        (!isSectionActive && isSectionActiveTouched);

      setIsSaveAvailable(isAnyChanges);
    },
    [isSectionActive, isSectionActiveTouched, isAnySelectorActive, isAnySelectorTouched],
  );

  return {isSaveAvailable, setIsSaveAvailable};
}

function useDisableInputNumberScroll() {
  React.useEffect(function preventInputNumberScroll() {
    const handlePreventScroll = () => {
      //@ts-ignore
      if (document.activeElement.type === 'number') {
        //@ts-ignore
        document.activeElement.blur();
      }
    };
    document.addEventListener('wheel', handlePreventScroll);

    return () => {
      document.removeEventListener('wheel', handlePreventScroll);
    };
  }, []);
}

export {
  useSuccessModal,
  useDebounce,
  useCorrectOptionSelection,
  useStatus,
  useScrollToTop,
  useIsMounted,
  usePrevious,
  useOutsideClick,
  useErrorToast,
  useModalControls,
  useAbortController,
  useErrorModal,
  useSubscriptionAskModal,
  useIsFormTouched,
  useWarningModal,
  useIsSelectorsSectionSaveAvailable,
  useAsyncOperation,
  useDisableInputNumberScroll,
  useCompare
};
