import React from 'react';
import i18n from '../../../i18n';
import {Trans, useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import * as Sentry from '@sentry/react';
import {useComputedDetails} from '../../../context/computedDetails';
import {useSubscription} from '../../../context/subscription';
import {useErrorToast} from '../../../utils/hooks';
import {getPaymentAmountEur, toastResponseError} from '../../../utils/common';
import {
  CURRENCIES_LABELS,
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_INTERVALS_OPTIONS,
  SUBSCRIPTION_PRODUCT_TYPES,
} from '../../../utils/constants';
import api, {queryFetcher} from '../../../api';
import {getStripeDate} from '../../../utils/subscription';
import type {Invoices, LineItem, Subscription, valueof} from '../../../utils/types';
import {Plan} from '../../../utils/types';
import {
  PaymentDetailsSection,
  PlanInfoPrice,
  PriceDetail,
  StyledLoader,
  BillingItemDetail,
  CapitalizeDetail,
} from './styled';

function fetchUpcomingInvoices() {
  return queryFetcher(api.payments.ENDPOINTS.upcomingInvoices());
}

function getNextPaymentAttemptDate(attempt?: number) {
  if (!attempt) {
    return '--/--/----';
  }

  return getStripeDate(attempt * 1000).format('DD/MM/YYYY'); // * 1000 - Convert time to ms
}

async function getPlan(id: string) {
  const {data, error} = await api.payments.getOnePlan(id);

  if (error) {
    toastResponseError(error);
  }
  return data;
}

type GetProductPriceDetails = {
  item: LineItem;
  plan: Plan;
  title: string;
  subscription?: Subscription;
  showInterval?: boolean;
};

function getProductPriceDetails({
  item,
  plan,
  title,
  showInterval,
}: GetProductPriceDetails) {
  const amount = getPaymentAmountEur(item.amount);
  const currencyLabel = CURRENCIES_LABELS[plan.currency];
  const accommodationsQuantity = item.quantity;

  const interval = plan.interval as valueof<typeof SUBSCRIPTION_INTERVALS>;
  const intervalLabel = (SUBSCRIPTION_INTERVALS_OPTIONS[interval]?.label as string) || '';

  return {
    amount,
    plan,
    item,
    product: plan.product,
    render: (
      <BillingItemDetail>
        <CapitalizeDetail>
          {`${showInterval ? intervalLabel.toLowerCase() : ''} ${i18n.t(title)} ${
            showInterval ? `x ${accommodationsQuantity}` : ''
          }`}
        </CapitalizeDetail>
        <b>{`${amount} ${currencyLabel}`}</b>
      </BillingItemDetail>
    ),
  };
}

const getPropsForPlanProduct = ({
  subscription,
}: Pick<GetProductPriceDetails, 'subscription'>) => ({
  [SUBSCRIPTION_PRODUCT_TYPES.chekin]: {title: 'plan', showInterval: true},
  [SUBSCRIPTION_PRODUCT_TYPES.selfCheckin]: {subscription, title: 'self_checkin'},
  [SUBSCRIPTION_PRODUCT_TYPES.remoteAccess]: {subscription, title: 'remote_access'},
  [SUBSCRIPTION_PRODUCT_TYPES.idVerification]: {subscription, title: 'id_verification'},
  [SUBSCRIPTION_PRODUCT_TYPES.documentStore]: {subscription, title: 'document_storage'},
  [SUBSCRIPTION_PRODUCT_TYPES.deposit]: {subscription, title: 'deposit'},
  [SUBSCRIPTION_PRODUCT_TYPES.tax]: {subscription, title: 'tax'},
});

async function getLineItemPriceDetails(item: LineItem, subscription: Subscription) {
  const planId = item.plan.id;
  const plan = await getPlan(planId);
  if (!plan) {
    return {
      render: <b>{i18n.t('unable_to_get_plan')}</b>,
    };
  }

  const propsForPlanProduct = getPropsForPlanProduct({
    subscription,
  })?.[plan.product as SUBSCRIPTION_PRODUCT_TYPES];

  if (propsForPlanProduct) {
    return getProductPriceDetails({item, plan, ...propsForPlanProduct});
  }

  return {render: <b>{i18n.t('unknown_plan')}</b>};
}

async function getSelfCheckinTax(invoices: Invoices, item: LineItem) {
  const planId = item.plan.id;
  const plan = await getPlan(planId);

  if (plan !== SUBSCRIPTION_PRODUCT_TYPES.selfCheckin) {
    return 0;
  }

  const amount = item.amount;
  const taxPercent = invoices.tax_percent || 0;

  return Number(amount) * ((100 + taxPercent) / 100) || 0;
}

type PriceDetailsItem = {
  amount?: string;
  plan?: Plan;
  item?: LineItem;
  product?: string;
  render: JSX.Element;
};

function sumChekinPlanPriceDetails(details: PriceDetailsItem[]) {
  let chekinProductDetails = [...details].filter((detail) => {
    return detail.product === SUBSCRIPTION_PRODUCT_TYPES.chekin;
  });

  if (chekinProductDetails.length > 1) {
    const uniqueDetails: {[key: string]: PriceDetailsItem} = {};

    chekinProductDetails.forEach((currentDetail) => {
      if (!currentDetail.plan?.id || uniqueDetails[currentDetail.plan.id]) {
        return;
      }

      uniqueDetails[currentDetail.plan!.id] = chekinProductDetails
        .filter((detail) => {
          return detail.plan?.id === currentDetail.plan?.id;
        })
        .reduce((prevValue, currentValue) => {
          if (!prevValue) {
            return currentValue;
          }

          const nextAmount =
            (prevValue?.item?.amount || 0) + (currentValue?.item?.amount || 0);
          return {
            ...prevValue,
            amount: String(nextAmount),
            item: {
              ...prevValue.item!,
              amount: nextAmount,
            },
          };
        });
    });

    const summedChekinPriceDetails = Object.values(uniqueDetails).map((detail) => {
      return getProductPriceDetails({
        item: detail.item!,
        plan: detail.plan!,
        showInterval: true,
        title: 'plan',
      });
    });
    const filteredFromChekinDetails = [...details].filter((detail) => {
      return detail.product !== SUBSCRIPTION_PRODUCT_TYPES.chekin;
    });

    return [...summedChekinPriceDetails, ...filteredFromChekinDetails];
  }

  return details;
}

async function sumSelfCheckinPlanPriceDetails(
  details: PriceDetailsItem[],
  subscription: Subscription,
) {
  let chekinProductDetails = [...details].filter((detail) => {
    return detail.product === SUBSCRIPTION_PRODUCT_TYPES.selfCheckin;
  });

  if (chekinProductDetails.length > 1) {
    const uniqueDetails: {[key: string]: PriceDetailsItem} = {};

    chekinProductDetails.forEach((currentDetail) => {
      if (!currentDetail.plan?.id || uniqueDetails[currentDetail.plan.id]) {
        return;
      }

      uniqueDetails[currentDetail.plan!.id] = chekinProductDetails
        .filter((detail) => {
          return detail.plan?.id === currentDetail.plan?.id;
        })
        .reduce((prevValue, currentValue) => {
          if (!prevValue) {
            return currentValue;
          }

          const nextAmount =
            (prevValue?.item?.amount || 0) + (currentValue?.item?.amount || 0);
          const nextQuantity =
            (prevValue?.item?.quantity || 0) + (currentValue?.item?.quantity || 0);
          return {
            ...prevValue,
            amount: String(nextAmount),
            item: {
              ...prevValue.item!,
              amount: nextAmount,
              quantity: nextQuantity,
            },
          };
        });
    });

    let summedChekinPriceDetails: PriceDetailsItem[] = [];
    const uniqueDetailsValues = Object.values(uniqueDetails);

    for await (const detail of uniqueDetailsValues) {
      const calculatedDetails = getProductPriceDetails({
        item: detail.item!,
        plan: detail.plan!,
        subscription,
        title: 'self_checkin',
      });
      summedChekinPriceDetails.push(calculatedDetails);
    }

    const filteredFromChekinDetails = [...details].filter((detail) => {
      return detail.product !== SUBSCRIPTION_PRODUCT_TYPES.selfCheckin;
    });

    return [...summedChekinPriceDetails, ...filteredFromChekinDetails];
  }

  return details;
}

type PriceDetails = {
  tax: number;
  discount: number;
  details: PriceDetailsItem[];
};

async function buildPriceDetails(
  invoices: Invoices,
  subscription: Subscription,
): Promise<PriceDetails> {
  if (!invoices && !subscription) {
    return {
      tax: 0,
      discount: 0,
      details: [],
    };
  }

  const lines = invoices.lines.data;
  const priceDetails: PriceDetailsItem[] = [];
  let tax = invoices.total_tax_amounts[0]?.amount || 0;
  const discount = invoices.total_discount_amounts[0]?.amount || 0;

  for await (let item of lines) {
    const details = await getLineItemPriceDetails(item, subscription);
    const selfCheckinTax = await getSelfCheckinTax(invoices, item);

    if (details) {
      priceDetails.push(details);
    }
    if (selfCheckinTax) {
      tax += selfCheckinTax;
    }
  }

  const summedSelfCheckinPriceDetails = await sumSelfCheckinPlanPriceDetails(
    priceDetails,
    subscription,
  );
  const calculatedDetails = sumChekinPlanPriceDetails(summedSelfCheckinPriceDetails);

  return {
    tax,
    discount,
    details: calculatedDetails,
  };
}

function fetchPriceDetails({
  queryKey: [, invoices, subscription],
}: {
  queryKey: [string, Invoices, Subscription];
}) {
  return buildPriceDetails(invoices, subscription).catch((err) => {
    Sentry.captureException(err);
    return Promise.reject(err);
  });
}

type BillingPricingProps = {
  hasUpcomingInvoices: boolean;
};

function BillingPricing({hasUpcomingInvoices}: BillingPricingProps) {
  const {t} = useTranslation();
  const {
    hasSubscribedWithFreeCheckinsLeft,
    subscription,
    isLoading: isLoadingSubscription,
  } = useSubscription();
  const {
    data: upcomingInvoices,
    error: upcomingInvoicesError,
    status: upcomingInvoicesStatus,
  } = useQuery<Invoices, string>('upcomingInvoices', fetchUpcomingInvoices, {
    refetchOnWindowFocus: false,
    enabled: hasUpcomingInvoices,
  });
  useErrorToast(upcomingInvoicesError, {
    notFoundMessage: 'Requested invoices could not be found. Please contact support.',
  });
  const {data: priceDetails, status: pricingDetailsStatus} = useQuery<
    PriceDetails,
    [string, Invoices, Subscription]
  >(['priceDetails', upcomingInvoices!, subscription!], fetchPriceDetails, {
    enabled: Boolean(upcomingInvoices && subscription),
  });

  const isLoading =
    isLoadingSubscription ||
    upcomingInvoicesStatus === 'loading' ||
    pricingDetailsStatus === 'loading';

  const getTotalPrice = () => {
    const totalPrice = upcomingInvoices?.amount_due;
    return getPaymentAmountEur(totalPrice);
  };

  const getTaxPercentage = () => {
    return upcomingInvoices?.default_tax_rates[0]?.percentage;
  };

  const getPaymentDate = () => {
    if (!upcomingInvoices) {
      return null;
    }

    return getNextPaymentAttemptDate(upcomingInvoices?.next_payment_attempt);
  };

  const totalPrice = getTotalPrice();
  const paymentDate = getPaymentDate();
  const taxPercentage = getTaxPercentage();
  const {currencyLabel} = useComputedDetails();

  if (isLoading) {
    return <StyledLoader width={35} height={35} label={t('loading')} />;
  }

  return (
    <PlanInfoPrice>
      {paymentDate ? (
        <div>
          {Boolean(priceDetails?.details?.length) && (
            <PaymentDetailsSection>
              {priceDetails?.details.map((detail, i) => {
                if (i + 1 !== priceDetails?.details.length) {
                  return <PriceDetail key={i}>{detail.render}</PriceDetail>;
                }

                return <PriceDetail key={i}>{detail.render}</PriceDetail>;
              })}
            </PaymentDetailsSection>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottom: '1px solid #ccd9eb',
              marginTop: 10,
            }}
          >
            <b>{`${t('tax')} (${taxPercentage}%)`}</b>
            <b>{`${getPaymentAmountEur(priceDetails?.tax)} ${currencyLabel}`}</b>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottom: '1px solid #ccd9eb',
              marginTop: 10,
            }}
          >
            <b>{'Total'}</b>
            <b style={{fontSize: 22}}>{`${totalPrice} ${currencyLabel}`}</b>
          </div>
          <div style={{paddingTop: 30}}>
            <Trans
              i18nKey="your_next_payment_of_amount"
              values={{amount: `${totalPrice} ${currencyLabel}`}}
            >
              Your next payment of <b>0.00 {{amount: currencyLabel}}</b>
            </Trans>
            {` `}
            <Trans i18nKey="will_be_due_on_date" values={{date: paymentDate}}>
              will be due on <b>00/00/0000</b>
            </Trans>
          </div>
        </div>
      ) : hasSubscribedWithFreeCheckinsLeft ? (
        <Trans
          i18nKey="you_next_payment_amount_will_be_on_trial_end"
          values={{amount: `${totalPrice} ${currencyLabel}`}}
        >
          Your next payment of <b>0 {{amount: currencyLabel}}</b> will be due when your
          trial ends
        </Trans>
      ) : (
        <div>
          {t('your_next_payment_of')} {` `}
          <b>
            {totalPrice} {currencyLabel}
          </b>
        </div>
      )}
    </PlanInfoPrice>
  );
}

export {BillingPricing};
