import React from 'react';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import api from '../../../api';
import {LightReservation} from '../../../utils/types';
import {checkTemplateIsWaivo, DEAL_STATUSES} from 'utils/upselling';
import {Deal, Offer} from '../../../utils/upselling/types';
import {useIsMounted, useModalControls} from '../../../utils/hooks';
import {toastResponseError} from '../../../utils/common';
import copyLinkIcon from '../../../assets/copy-link-icon.svg';
import shareByEmail from '../../../assets/sharebyemail.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import Section from '../Section';
import UpsellingItem, {UpsellingLastItem} from '../UpsellingItem';
import ModalButton from '../ModalButton';
import Modal from '../Modal';
import {DamageProtectionSubSection} from './components/DamageProtectionSubSection';
import {
  ButtonGroup,
  CopyLinkButtonStyled,
  HorizontalLine,
  ListDealsItems,
  LoaderStyled,
  SendEmailButtonStyled,
  TitleBlock,
  UpsellingLinkSection,
} from './styled';

const emailSendingTimeoutMs = 1500;

type ReservationUpsellingSectionProps = {
  reservation: LightReservation;
};

type GroupDealsByStatus = Record<DEAL_STATUSES, Deal[]>;

function ReservationUpsellingSection({reservation}: ReservationUpsellingSectionProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const {paymentSettingsCurrencyOnlySymbol} = usePaymentSettings();
  const isOnlineCheckinEmail = Boolean(reservation?.default_invite_email);
  const {
    closeModal: closeEmailMissingModal,
    isOpen: isEmailMissingModalOpen,
    openModal: openEmailMissingModal,
  } = useModalControls();
  const emailSendingTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  React.useEffect(() => {
    return () => {
      if (emailSendingTimeout.current) {
        clearTimeout(emailSendingTimeout.current);
      }
    };
  }, []);

  const {data: totalRevenue, isLoading: isLoadingTotalRevenue} = useQuery<{
    count: number;
    revenue: number;
  }>(api.upselling.ENDPOINTS.dealsReports(`reservation_id=${reservation.id}`), {
    onError: (error: any) => {
      if (error && isMounted.current) {
        toastResponseError(error);
      }
    },
  });

  const offersQueryKey = api.upselling.ENDPOINTS.offers(
    `housing_id=${reservation.housing_id}`,
  );
  const {data: offers, isLoading: isLoadingOffers} = useQuery<Offer[], Error>(
    offersQueryKey,
    {
      refetchOnWindowFocus: false,
      onError: (error) => {
        if (error && isMounted.current) {
          toastResponseError(error);
        }
      },
    },
  );
  const hasWaivoDeal = React.useMemo(() => {
    if (!offers?.length) return false;
    return offers.some((singleOffer) => checkTemplateIsWaivo(singleOffer.template));
  }, [offers]);

  const dealsQueryKey = api.upselling.ENDPOINTS.deals(`reservation_id=${reservation.id}`);
  const {data: deals, isLoading: isLoadingDeals, isSuccess: isSuccessDeals} = useQuery<
    Deal[],
    Error
  >(dealsQueryKey, {
    onError: (error) => {
      if (error && isMounted.current) {
        toastResponseError(error);
      }
    },
  });

  const groupedByStatusDeals: GroupDealsByStatus = React.useMemo(() => {
    const dealsByStatus: GroupDealsByStatus = {
      [DEAL_STATUSES.requested]: [],
      [DEAL_STATUSES.approved]: [],
      [DEAL_STATUSES.paid]: [],
      [DEAL_STATUSES.rejected]: [],
    };

    deals?.forEach((singleDeal) => {
      if (singleDeal.status === DEAL_STATUSES.requested) {
        dealsByStatus[DEAL_STATUSES.requested].push(singleDeal);
      }
      if (singleDeal.status === DEAL_STATUSES.approved) {
        dealsByStatus[DEAL_STATUSES.approved].push(singleDeal);
      }
      if (singleDeal.status === DEAL_STATUSES.rejected) {
        dealsByStatus[DEAL_STATUSES.rejected].push(singleDeal);
      }
      if (singleDeal.status === DEAL_STATUSES.paid) {
        dealsByStatus[DEAL_STATUSES.paid].push(singleDeal);
      }
    });
    return dealsByStatus;
  }, [deals]);

  const countDeals = (status: DEAL_STATUSES) => {
    return groupedByStatusDeals[status].length || 0;
  };

  const dealsRequestedCount = countDeals(DEAL_STATUSES.requested);
  const dealsApprovedCount = countDeals(DEAL_STATUSES.approved);
  const dealsPaidCount = countDeals(DEAL_STATUSES.paid);
  const dealsRejectedCount = countDeals(DEAL_STATUSES.rejected);

  const updateDealStatusMutation = useMutation<
    Deal,
    any,
    {id: string; status: DEAL_STATUSES},
    {prevDeals: Deal[]}
  >((payload) => api.upselling.updateDealMutation(payload), {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(dealsQueryKey);
      const prevDeals = queryClient.getQueryData<Deal[]>(dealsQueryKey);
      const optimisticDeals = prevDeals?.map((deal) => {
        if (deal.id === payload.id) {
          const updatedDeal = {...deal, status: payload.status};
          return updatedDeal;
        }
        return deal;
      });

      queryClient.setQueryData(dealsQueryKey, optimisticDeals);
      return {prevDeals: prevDeals || []};
    },
    onError: (error, payload, context) => {
      if (error && isMounted.current) {
        queryClient.setQueryData(dealsQueryKey, context?.prevDeals);
        toastResponseError(error);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(dealsQueryKey);
    },
  });

  const sendEmailMutation = useMutation<{status: string}>(
    () => api.reservations.sendUpsellingDealsListEmailMutation(reservation.id),
    {
      onSettled: () => {
        emailSendingTimeout.current = setTimeout(() => {
          sendEmailMutation.reset();
        }, emailSendingTimeoutMs);
      },
    },
  );

  const handleApprove = (dealId: string) => {
    updateDealStatusMutation.mutate({id: dealId, status: DEAL_STATUSES.approved});
  };

  const handleReject = (dealId: string) => {
    updateDealStatusMutation.mutate({id: dealId, status: DEAL_STATUSES.rejected});
  };

  const handleEmailMissingModal = () => {
    if (!isOnlineCheckinEmail) {
      openEmailMissingModal();
      return;
    }

    sendEmailMutation.mutate();
  };

  return (
    <Section title={t('upselling')}>
      <Modal
        open={isEmailMissingModalOpen}
        onClose={closeEmailMissingModal}
        title={t('email_missing')}
        text={t('email_missing_popup_text')}
        iconSrc={warningIcon}
        iconAlt="warning"
        iconProps={{
          height: 84,
          width: 84,
        }}
      >
        <ModalButton onClick={closeEmailMissingModal} label={t('confirm')} />
      </Modal>
      {isLoadingDeals && <LoaderStyled width={50} height={50} label={t('loading')} />}
      {isSuccessDeals && (
        <ListDealsItems>
          <UpsellingItem
            title={t('deals_requested_count', {
              number: dealsRequestedCount,
            })}
            deals={groupedByStatusDeals[DEAL_STATUSES.requested]}
            onApprove={handleApprove}
            onReject={handleReject}
            buttons
          />
          <UpsellingItem
            title={t('deals_approved_count', {
              number: dealsApprovedCount,
            })}
            deals={groupedByStatusDeals[DEAL_STATUSES.approved]}
          />
          <UpsellingItem
            title={t('deals_paid_count', {
              number: dealsPaidCount,
            })}
            deals={groupedByStatusDeals[DEAL_STATUSES.paid]}
          />
          <UpsellingItem
            title={t('deals_rejected_count', {
              number: dealsRejectedCount,
            })}
            deals={groupedByStatusDeals[DEAL_STATUSES.rejected]}
          />
          <UpsellingLastItem
            title={t('total_revenue') + ':'}
            currency={paymentSettingsCurrencyOnlySymbol}
            totalRevenue={totalRevenue?.revenue}
            loading={isLoadingTotalRevenue}
          />
        </ListDealsItems>
      )}
      <HorizontalLine />
      <UpsellingLinkSection
        title={<TitleBlock>{t('upselling_link')}</TitleBlock>}
        subtitle={t('upselling_link_section_subtitle')}
      >
        <ButtonGroup>
          <CopyLinkButtonStyled icon={copyLinkIcon} link={reservation?.upselling_link} />
          <SendEmailButtonStyled
            sendEmail={handleEmailMissingModal}
            status={sendEmailMutation.status}
            icon={shareByEmail}
            label={t('share_by_email')}
            disabled={sendEmailMutation.isLoading}
          />
        </ButtonGroup>
      </UpsellingLinkSection>
      {hasWaivoDeal && <DamageProtectionSubSection isLoading={isLoadingOffers} />}
    </Section>
  );
}

export {ReservationUpsellingSection};
