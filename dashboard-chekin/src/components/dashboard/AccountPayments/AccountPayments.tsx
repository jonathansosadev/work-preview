import React from 'react';
import {useTranslation} from 'react-i18next';
import {useMutation, useQueryClient} from 'react-query';
import {useLocation} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import moment, {isMoment} from 'moment';
import {useAuth} from '../../../context/auth';
import {useWebsocket} from '../../../context/websocket';
import api from '../../../api';
import i18n from '../../../i18n';
import {openHubspotChat} from '../../../analytics/hubspot';
import {
  useAsyncOperation,
  useErrorModal,
  useModalControls,
  useStatus,
  useSuccessModal,
} from '../../../utils/hooks';
import {
  CoreError,
  PAYMENTS_SETTINGS_STATUSES,
  PaymentsSettings,
  User,
} from '../../../utils/types';
import {PAYMENT_PROVIDERS, WS_EVENT_TYPES} from '../../../utils/constants';
import {
  downloadFromLink,
  getSearchParamFromUrl,
  toastResponseError,
} from '../../../utils/common';
import {USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY} from '../UserPaymentsProviderIncompleteModal';
import {useUser} from '../../../context/user';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import relaxIcon from '../../../assets/relax-icon.svg';
import transferIcon from '../../../assets/transfer-icon.svg';
import stripeIconActive from 'assets/stripe-logo-active.svg';
import stripeIconInactive from 'assets/stripe-logo-inactive.svg';
import sepaIconActive from 'assets/sepa-logo-active.svg';
import sepaIconInactive from 'assets/sepa-logo-inactive.svg';
import redWarningIcon from 'assets/red-warning.svg';
import Section from '../Section';
import Button from '../Button';
import DateModal, {SearchDates} from '../DateModal';
import PaymentsDocumentsVerificationModal from '../PaymentsDocumentsVerificationModal';
import PaymentsTransferModal from '../PaymentsTransferModal';
import Loader from '../../common/Loader';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import PaymentsMovementsPreview from '../PaymentsMovementsPreview';
import PaymentsTooltip from '../PaymentsTooltip';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {
  Balance,
  TransferBlock,
  BalanceIcon,
  BalanceLabel,
  BalanceWrapper,
  ContactSupportButton,
  LoaderWrapper,
  PaymentsStatusDetails,
  RetryButton,
  SectionWrapper,
  StatusDetails,
  StatusWrapper,
  TryAgainButtonWrapper,
  Wrapper,
  ChangeAccountButton,
  Subtitle,
  ConnectionButtonsWrapper,
  ConnectPaymentButton,
  InputStyled,
  Form,
  ButtonStyled,
  TooltipStyled,
} from './styled';

const balancePlaceholder = '0.00';
const ACCOUNT_PAGE_VISITED_LOCAL_STORAGE_KEY = 'isPaymentsPageVisited';
const paymentProvidersWithTransferSupport = [PAYMENT_PROVIDERS.paycomet];
const stripeRefreshUrlParam = 'is_need_to_refresh';
const stripeSuccessUrlParam = 'is_successfully_created';
const stripeSuccessStatus = 'FILLING_FINISHED';
const successButtonMs = 3000;
const minVatPercent = 0;
const maxVatPercent = 100;

export enum FormNames {
  vatPercentage = 'vat_percentage',
}

export type FormTypes = {
  [FormNames.vatPercentage]: number;
};

const statusTexts = {
  [PAYMENTS_SETTINGS_STATUSES.new]: i18n.t('waiting_for_verification'),
  [PAYMENTS_SETTINGS_STATUSES.validating]: i18n.t('waiting_for_verification'),
  [PAYMENTS_SETTINGS_STATUSES.invalid]: i18n.t('verification_failed'),
  [PAYMENTS_SETTINGS_STATUSES.valid]: '',
  [PAYMENTS_SETTINGS_STATUSES.readyForValidation]: i18n.t('ready_for_validation'),
  [PAYMENTS_SETTINGS_STATUSES.fillingInProgress]: i18n.t('in_progress'),
  [PAYMENTS_SETTINGS_STATUSES.waitForFilling]: i18n.t('in_progress'),
  [PAYMENTS_SETTINGS_STATUSES.detailsSubmitted]: i18n.t(
    'waiting_for_verification_stripe',
  ),
  [PAYMENTS_SETTINGS_STATUSES.fillingFinished]: i18n.t('in_progress'),
  [PAYMENTS_SETTINGS_STATUSES.waitForFilling]: i18n.t('in_progress'),
};

const retryPaymentSettingsStatuses = [
  PAYMENTS_SETTINGS_STATUSES.fillingInProgress,
  PAYMENTS_SETTINGS_STATUSES.waitForFilling,
  PAYMENTS_SETTINGS_STATUSES.fillingFinished,
  PAYMENTS_SETTINGS_STATUSES.invalid,
];

function getBalance(user?: User | null) {
  if (!user?.balance) {
    return balancePlaceholder;
  }

  return user.balance?.toFixed(2);
}

function AccountPayments() {
  const {t} = useTranslation();
  const ws = useWebsocket();
  const queryClient = useQueryClient();
  const {ErrorModal, displayError} = useErrorModal();
  const {SuccessModal, displaySuccess} = useSuccessModal();
  const location = useLocation();
  const {refreshAccount} = useAuth();
  const user = useUser();
  const {setStatus, isLoading} = useStatus();
  const {
    setStatus: setExcelDownloadingStatus,
    isLoading: isDownloadingExcel,
  } = useStatus();
  const {asyncOperation} = useAsyncOperation();
  const [nextProvider, setNextProvider] = React.useState<PAYMENT_PROVIDERS | null>(null);
  const isRedirectSkippedRef = React.useRef(false);
  const timeoutSuccessButtonRef = React.useRef<ReturnType<typeof setTimeout>>();

  const {
    register,
    formState: {errors},
    reset,
    ...formMethods
  } = useForm<FormTypes>();

  const {
    isOpen: isPaymentsModalOpen,
    openModal: openPaymentsModal,
    closeModal: closePaymentsModal,
  } = useModalControls();
  const {
    isOpen: isTransferModalOpen,
    openModal: openTransferModal,
    closeModal: closeTransferModal,
  } = useModalControls();
  const {
    isOpen: isStillValidatingModalOpen,
    openModal: openStillValidatingModal,
    closeModal: closeStillValidatingModal,
  } = useModalControls();
  const {
    isOpen: isPaymentSettingsModalOpen,
    openModal: openPaymentSettingsModal,
    closeModal: closePaymentSettingsModal,
  } = useModalControls();
  const {
    isOpen: isRedirectModalOpen,
    openModal: openRedirectModal,
    closeModal: closeRedirectModal,
  } = useModalControls();
  const {
    isOpen: isExcelModalOpen,
    openModal: openExcelModal,
    closeModal: closeExcelModal,
  } = useModalControls();

  const {
    paymentSettings,
    paymentSettingsCurrencyLabel,
    paymentSettingsCurrencyOnlySymbol,
    isLoadingPaymentSettings,
    status: paymentsSettingsStatus,
    refetch: refetchPaymentSettings,
  } = usePaymentSettings();
  const {
    isOpen: isLoseBalanceWarningModalOpen,
    openModal: openLoseBalanceWarningModal,
    closeModal: closeLoseBalanceWarningModal,
  } = useModalControls();

  const paymentProvider = paymentSettings?.provider;
  const paymentSettingsStatus = paymentSettings?.status;
  const isTransferAvailable =
    paymentProvider &&
    paymentProvidersWithTransferSupport.includes(paymentProvider) &&
    Number(user?.balance) > 0;
  const isStripeRetryButtonVisible =
    paymentProvider === PAYMENT_PROVIDERS.stripe &&
    paymentSettingsStatus &&
    retryPaymentSettingsStatuses.includes(paymentSettingsStatus);
  const isNeedToShowSuccessModal =
    getSearchParamFromUrl(stripeSuccessUrlParam, location.search) === '1';
  const isChangeBankAccountButtonVisible =
    paymentProvider === PAYMENT_PROVIDERS.paycomet &&
    paymentSettingsStatus !== PAYMENTS_SETTINGS_STATUSES.validating;
  const isStripeProvider =
    paymentProvider === PAYMENT_PROVIDERS.stripe &&
    paymentSettingsStatus !== PAYMENTS_SETTINGS_STATUSES.invalid;
  const isSepaProvider = paymentProvider === PAYMENT_PROVIDERS.paycomet;

  const hasPaymentSettings = React.useMemo(() => {
    if (!paymentSettings) {
      return false;
    }
    return Boolean(Object.keys(paymentSettings)?.length);
  }, [paymentSettings]);

  const paymentSettingsMutation = useMutation<
    PaymentsSettings,
    CoreError,
    {payload: any; id?: string}
  >(api.paymentsSettings.mutatePaymentSettings, {
    onMutate: () => {
      setStatus('loading');
    },
    onError: (error) => {
      setStatus('idle');

      if (isPaymentSettingsModalOpen) {
        toastResponseError(error);
      } else {
        displayError(error);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData('paymentsSettings', data);
    },
  });

  React.useEffect(() => {
    return () => {
      if (timeoutSuccessButtonRef.current) {
        clearTimeout(timeoutSuccessButtonRef.current);
      }
    };
  }, []);

  React.useEffect(
    function preloadPaymentSettingsToFormData() {
      reset({[FormNames.vatPercentage]: paymentSettings?.vat_percentage});
    },
    [paymentSettings?.vat_percentage, reset],
  );

  React.useEffect(() => {
    refreshAccount();
  }, [refreshAccount]);

  const handleGetDownloadExcelLink = React.useCallback(
    async (id: string) => {
      await asyncOperation(() => api.documents.getDownloadExcelPaymentsLink(id), {
        onSuccess: ({link}) => {
          setExcelDownloadingStatus('idle');
          downloadFromLink(link);
        },
      });
    },
    [setExcelDownloadingStatus, asyncOperation],
  );

  React.useEffect(
    function handleDownloadExcelWSEvents() {
      if (ws.message.event_type === WS_EVENT_TYPES.paymentsReportExcelFinished) {
        handleGetDownloadExcelLink(ws.message.user_payments_report_id);
      }
      if (ws.message.event_type === WS_EVENT_TYPES.paymentsReportExcelFailed) {
        displayError(ws.message.status_details);
      }

      return ws.clearMessage;
    },
    [
      displayError,
      handleGetDownloadExcelLink,
      ws.message.event_type,
      ws.message.user_payments_report_id,
      ws,
    ],
  );

  const clearPaymentSettingsIncompleteModalStorageKey = React.useCallback(() => {
    localStorage.removeItem(USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY);
  }, []);

  React.useEffect(
    function handleStripeConnectionWSEvents() {
      if (ws.message.event_type === WS_EVENT_TYPES.paymentsSettingsWaitForFilling) {
        if (isNeedToShowSuccessModal && !isRedirectSkippedRef.current) {
          isRedirectSkippedRef.current = true;
          refetchPaymentSettings();
          return;
        }

        const link = ws.message.account_filling_link;
        window.location.assign(link);
      }

      if (ws.message.event_type === WS_EVENT_TYPES.paymentsSettingsValid) {
        refetchPaymentSettings();
        clearPaymentSettingsIncompleteModalStorageKey();
        displaySuccess(t('stripe_account_created'));
      }

      if (ws.message.event_type === WS_EVENT_TYPES.paymentsSettingsDetailsSubmitted) {
        refetchPaymentSettings();
        clearPaymentSettingsIncompleteModalStorageKey();
        displaySuccess(t('stripe_account_details_submitted'));
      }

      return ws.clearMessage;
    },
    [
      refetchPaymentSettings,
      ws,
      isNeedToShowSuccessModal,
      displaySuccess,
      t,
      setStatus,
      clearPaymentSettingsIncompleteModalStorageKey,
    ],
  );

  const refreshStripeLink = React.useCallback(() => {
    return asyncOperation(
      () => {
        setStatus('loading');
        openRedirectModal();
        return api.paymentsSettings.refresh();
        // Waiting for WS_EVENT_TYPES.paymentsSettingsWaitForFilling
      },
      {
        onError: (error) => {
          closeRedirectModal();
          displayError(error);
          setStatus('idle');
        },
      },
    );
  }, [asyncOperation, closeRedirectModal, displayError, openRedirectModal, setStatus]);

  React.useEffect(() => {
    const isNeedToRefreshStripeLink =
      getSearchParamFromUrl(stripeRefreshUrlParam, location.search) === '1';

    if (isNeedToRefreshStripeLink) {
      refreshStripeLink();
    }
  }, [location.search, refreshStripeLink]);

  const setSuccessfulStripeStatus = React.useCallback(
    (id: string) => {
      const payload = {
        status: stripeSuccessStatus,
      };

      paymentSettingsMutation.mutate(
        {payload, id},
        {
          onSuccess: () => {
            setStatus('idle');
          },
        },
      );
    },
    [paymentSettingsMutation, setStatus],
  );

  React.useEffect(
    function confirmStripeSuccess() {
      const paymentSettingsId = paymentSettings?.id;

      if (isNeedToShowSuccessModal && paymentSettingsId) {
        setSuccessfulStripeStatus(paymentSettingsId);
      }
    },
    [paymentSettings?.id, setSuccessfulStripeStatus, isNeedToShowSuccessModal],
  );

  React.useLayoutEffect(
    function openPaymentSettingsIfFirstTimeVisitingPage() {
      const isFirstTimeVisitingPage =
        !localStorage.getItem(ACCOUNT_PAGE_VISITED_LOCAL_STORAGE_KEY) &&
        !isLoadingPaymentSettings &&
        !hasPaymentSettings;

      if (isFirstTimeVisitingPage) {
        openPaymentSettingsModal();
        localStorage.setItem(ACCOUNT_PAGE_VISITED_LOCAL_STORAGE_KEY, 'true');
      }
    },
    [hasPaymentSettings, isLoadingPaymentSettings, openPaymentSettingsModal],
  );

  const handleCreateReport = async (payload: SearchDates) => {
    setExcelDownloadingStatus('loading');
    await asyncOperation(() =>
      api.documents.createPaymentsReports({
        from_date: isMoment(payload?.from)
          ? moment(payload?.from)?.format('YYYY-MM-DD')
          : undefined,
        to_date: isMoment(payload?.to)
          ? moment(payload?.to)?.format('YYYY-MM-DD')
          : undefined,
      }),
    );
  };

  const handleTransferButtonClick = () => {
    if (paymentSettingsStatus === PAYMENTS_SETTINGS_STATUSES.valid) {
      openTransferModal();
      return;
    }

    if (
      paymentSettingsStatus === PAYMENTS_SETTINGS_STATUSES.validating ||
      paymentSettingsStatus === PAYMENTS_SETTINGS_STATUSES.new
    ) {
      openStillValidatingModal();
      return;
    }

    openPaymentsModal();
  };

  const getStripeStatusLabel = () => {
    const isStripeConnected =
      isStripeProvider && paymentSettingsStatus === PAYMENTS_SETTINGS_STATUSES.valid;
    const isStripeConnecting = isStripeProvider && !isStripeConnected;

    if (isStripeConnected) {
      return t('connected_to_stripe');
    }
    if (isStripeConnecting) {
      return t('connecting_to_stripe');
    }
    return t('connect_stripe');
  };

  const getSEPAConnectionPayload = () => {
    return {
      provider: PAYMENT_PROVIDERS.paycomet,
    };
  };

  const setDefaultSEPAProvider = () => {
    const payload = getSEPAConnectionPayload();

    paymentSettingsMutation.mutate(
      {payload, id: paymentSettings?.id},
      {
        onSuccess: () => {
          setStatus('idle');
          openPaymentsModal();
          closePaymentSettingsModal();
        },
      },
    );
  };

  const getStripeConnectionPayload = () => {
    if (hasPaymentSettings) {
      return {
        status: 'NEW',
        provider: PAYMENT_PROVIDERS.stripe,
      };
    }

    return {
      provider: PAYMENT_PROVIDERS.stripe,
    };
  };

  const startStripeConnection = () => {
    const payload = getStripeConnectionPayload();
    paymentSettingsMutation.mutate({payload, id: paymentSettings?.id});
  };

  const handleSettingsSEPAButtonClick = () => {
    setDefaultSEPAProvider();
  };

  const handleSettingsStripeButtonClick = async () => {
    startStripeConnection();
  };

  const providerChangeHandlers = {
    [PAYMENT_PROVIDERS.paycomet]: handleSettingsSEPAButtonClick,
    [PAYMENT_PROVIDERS.stripe]: handleSettingsStripeButtonClick,
  };

  const changeProvider = (provider: PAYMENT_PROVIDERS) => {
    const changeHandler = providerChangeHandlers[provider];

    if (!changeHandler) {
      throw new Error(
        `Unknown payment provider supplied to providerChangeHandlers: ${provider}`,
      );
    }
    changeHandler();
  };

  const handlePaymentProviderChange = (nextProvider: PAYMENT_PROVIDERS) => {
    if (paymentProvider === nextProvider) return;
    const userBalance = user?.balance || 0;
    const hasBalance = userBalance > 0;
    const canLoseBalance =
      paymentSettings?.provider || nextProvider === PAYMENT_PROVIDERS.stripe;

    if (hasBalance && canLoseBalance) {
      setNextProvider(nextProvider);
      openLoseBalanceWarningModal();

      return;
    }

    changeProvider(nextProvider);
  };

  const handleChangeVatPayments = (formData: FormTypes) => {
    paymentSettingsMutation.mutate(
      {payload: formData, id: paymentSettings?.id},
      {
        onSuccess: () => {
          timeoutSuccessButtonRef.current = setTimeout(() => {
            paymentSettingsMutation.reset();
          }, successButtonMs);
          setStatus('idle');
        },
      },
    );
  };

  return (
    <SectionWrapper>
      <Section
        title={t('payments_settings_title')}
        titleTooltip={
          <div>
            {t('payments_settings_subtitle_tooltip')}
            <br />
            <br />
            <a href={t('payments_protection_link')} rel="noreferrer" target="_blank">
              {t('learn_more')}
            </a>
          </div>
        }
        subtitle={<Subtitle>{t('payments_settings_subtitle')}</Subtitle>}
        subtitleTooltip={
          <PaymentsTooltip
            currencyLabel={paymentSettingsCurrencyLabel}
            title={t('payments_tooltip_title')}
          />
        }
      >
        <Wrapper>
          <ConnectionButtonsWrapper>
            <ConnectPaymentButton
              isActive={isStripeProvider}
              disabled={isLoading}
              icon={
                <img
                  src={isStripeProvider ? stripeIconActive : stripeIconInactive}
                  alt=""
                />
              }
              label={getStripeStatusLabel()}
              onClick={() => handlePaymentProviderChange(PAYMENT_PROVIDERS.stripe)}
            />
            {isSepaProvider && (
              <ConnectPaymentButton
                isActive={isSepaProvider}
                disabled={isLoading}
                icon={
                  <img src={isSepaProvider ? sepaIconActive : sepaIconInactive} alt="" />
                }
                label={t('bank_transfer')}
                onClick={() => handlePaymentProviderChange(PAYMENT_PROVIDERS.paycomet)}
              />
            )}
          </ConnectionButtonsWrapper>
          {hasPaymentSettings && (
            <>
              <StatusWrapper>
                {paymentSettings!.status !== PAYMENTS_SETTINGS_STATUSES.valid && (
                  <span>
                    {t('status').toUpperCase()}: {` `}
                    <StatusDetails status={paymentSettings!.status}>
                      {statusTexts[paymentSettings!.status]}
                      {isStripeRetryButtonVisible && (
                        <RetryButton
                          blinking={isLoading}
                          disabled={isLoading}
                          onClick={handleSettingsStripeButtonClick}
                        >
                          {t('retry')}
                        </RetryButton>
                      )}
                      {paymentSettings!.status === PAYMENTS_SETTINGS_STATUSES.invalid && (
                        <span>
                          <PaymentsStatusDetails>
                            {paymentSettings?.status_details &&
                              ` - ${paymentSettings?.status_details}`}
                          </PaymentsStatusDetails>
                          <TryAgainButtonWrapper>
                            <Button
                              secondary
                              label={t('try_again')}
                              onClick={openPaymentsModal}
                              disabled={isLoadingPaymentSettings}
                            />
                          </TryAgainButtonWrapper>
                          <ContactSupportButton onClick={openHubspotChat} type="button">
                            {t('or_contact_support')}
                          </ContactSupportButton>
                        </span>
                      )}
                    </StatusDetails>
                  </span>
                )}{' '}
                {isChangeBankAccountButtonVisible && (
                  <ChangeAccountButton
                    secondary
                    label={t('change_bank_account')}
                    onClick={openPaymentsModal}
                    disabled={isLoadingPaymentSettings}
                  />
                )}
              </StatusWrapper>
              <Form onSubmit={formMethods.handleSubmit(handleChangeVatPayments)}>
                <InputStyled
                  {...register(FormNames.vatPercentage, {
                    min: {
                      value: minVatPercent,
                      message: t('min_number_is', {number: minVatPercent}),
                    },
                    max: {
                      value: maxVatPercent,
                      message: t('max_number_is', {number: maxVatPercent}),
                    },
                  })}
                  disabled={isLoading || paymentSettingsMutation.isLoading}
                  type="number"
                  inputMode="numeric"
                  label={t('vat_optional')}
                  tooltip={<TooltipStyled content={t('vat_optional_tooltip')} />}
                  placeholder={t('enter_number')}
                  error={errors[FormNames.vatPercentage]?.message}
                />
                <ButtonStyled
                  type="submit"
                  label={paymentSettingsMutation.isSuccess ? t('Success') : t('save')}
                  disabled={
                    isLoading ||
                    paymentSettingsMutation.isLoading ||
                    paymentSettingsMutation.isSuccess
                  }
                  success={paymentSettingsMutation.isSuccess}
                />
              </Form>
              <BalanceWrapper>
                <BalanceLabel>{t('your_balance')}</BalanceLabel>
                <Balance>
                  {isLoadingPaymentSettings ? (
                    <LoaderWrapper>
                      <Loader height={35} width={35} />
                    </LoaderWrapper>
                  ) : (
                    getBalance(user) + ' ' + paymentSettingsCurrencyOnlySymbol
                  )}
                </Balance>
                {isTransferAvailable && (
                  <TransferBlock>
                    <Button
                      disabled={isLoadingPaymentSettings}
                      label={
                        <>
                          <BalanceIcon src={transferIcon} alt="Transfer coin" />
                          {t('transfer_to_my_account')}
                        </>
                      }
                      onClick={handleTransferButtonClick}
                    />
                  </TransferBlock>
                )}
              </BalanceWrapper>
              <PaymentsMovementsPreview
                onOpenExcelModal={openExcelModal}
                isDownloadingExcel={isDownloadingExcel}
              />
            </>
          )}
        </Wrapper>
      </Section>
      {isPaymentsModalOpen && (
        <PaymentsDocumentsVerificationModal
          open
          onClose={closePaymentsModal}
          paymentsSettingsStatus={paymentsSettingsStatus}
          paymentsSettings={paymentSettings}
        />
      )}
      {isTransferModalOpen && (
        <PaymentsTransferModal
          open={isTransferModalOpen}
          onClose={closeTransferModal}
          paymentSettings={paymentSettings}
        />
      )}
      <Modal
        closeOnDocumentClick
        closeOnEscape
        iconProps={{
          height: 97,
          width: 80,
          src: relaxIcon,
          alt: '',
        }}
        title={t('validating')}
        text={t('your_payment_account_validating')}
        open={isStillValidatingModalOpen}
        onClose={closeStillValidatingModal}
      >
        <ModalButton label={t('ok')} onClick={closeStillValidatingModal} />
      </Modal>
      <Modal
        open={isRedirectModalOpen}
        title={t('please_wait')}
        text={t('you_will_be_redirected')}
        iconProps={{
          height: 97,
          width: 80,
          src: relaxIcon,
          alt: '',
        }}
      />
      <Modal
        open={isLoseBalanceWarningModalOpen}
        title={t('pending_balance')}
        text={t('you_will_lose_balance')}
        iconProps={{
          src: redWarningIcon,
          alt: '',
          height: 84,
          width: 84,
        }}
      >
        <ModalTwoButtonsWrapper>
          <ModalButton
            danger
            label={t('lose_my_money')}
            onClick={() => {
              changeProvider(nextProvider!);
              closeLoseBalanceWarningModal();
            }}
          />
          <ModalButton
            secondary
            label={t('go_back')}
            onClick={closeLoseBalanceWarningModal}
          />
        </ModalTwoButtonsWrapper>
      </Modal>
      <DateModal
        open={isExcelModalOpen}
        onClose={closeExcelModal}
        onSubmit={handleCreateReport}
      />
      <SuccessModal />
      <ErrorModal />
    </SectionWrapper>
  );
}

export {AccountPayments, ACCOUNT_PAGE_VISITED_LOCAL_STORAGE_KEY};
