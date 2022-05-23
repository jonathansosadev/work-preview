import React from 'react';
import {NestedValue} from 'react-hook-form';
export const CORE_FIELDS_PREFIX = 'coreFields';

export enum FORM_NAMES {
  currency = 'currency',
  bookingPayment = 'coreFields_bookingPayment',
  taxesPayment = 'coreFields_taxesPayment',
  extraServices = 'extraServices',
  totalPayment = 'totalPayment',
  amountPaid = 'amountPaid',
  amountDue = 'amountDue',
  depositAmount = 'security_deposit_amount',
  subtotal = 'subtotal',
  transactionFee = 'transactionFee',
  transactionFeeForEu = 'transactionFeeForEu',
}

export enum RESERVATION_PAYMENT_STATUSES {
  inactive = 'INACTIVE',
  optional = 'OPTIONAL',
  mandatory = 'MANDATORY',
}

export enum UPSELLING_PAYMENTS_STATUSES {
  active = 'ACTIVE',
  inactive = 'INACTIVE',
}

export type CoreFields = FORM_NAMES.bookingPayment | FORM_NAMES.taxesPayment;

export enum PayloadStatus {
  ENABLED = 'ENABLED',
  PAID = 'PAID',
  PENDING = 'PENDING',
}

export enum PaymentsTypes {
  BOOKING = 'BOOKING',
  PMS = 'PMS_INTEGRATION',
  TOURIST_TAXES = 'TOURIST_TAXES',
  EXTRA_SERVICE = 'EXTRA_SERVICE',
}

export type ReservationPaymentsPayloadItem = {
  status: PayloadStatus;
  type: PaymentsTypes;
  amount: number | string;
  name: string;
  guest_commission_amount?: number;
  id?: string;
  payment_id?: string;
  external_id?: string;
};

export type ReservationPaymentsRefType =
  | undefined
  | {
      getReservationDepositPayload: () => {security_deposit_amount: string | number};
      getReservationPaymentsPayload: () => ReservationPaymentsPayloadItem[];
      onReservationPaymentsSuccess: () => void;
      triggerPaymentsValidation: () => Promise<any>;
      totalAmount: number;
    };

export const payloadCreator = (
  field: CoreFields,
  amount: number | string,
  status: PayloadStatus,
  id?: string,
  type?: PaymentsTypes,
) => {
  const payload: {
    amount: number | string;
    status: PayloadStatus;
    type?: PaymentsTypes;
    id?: string;
    payment_id?: string;
  } = {
    status,
    amount,
  };

  if (id) {
    payload.id = id;
    payload.payment_id = id;
  }

  if (type) {
    payload.type = type;
  }

  switch (field) {
    case FORM_NAMES.bookingPayment:
      return {
        name: 'Booking',
        type: PaymentsTypes.BOOKING,
        ...payload,
      };
    case FORM_NAMES.taxesPayment:
      return {
        name: 'Taxes',
        type: PaymentsTypes.TOURIST_TAXES,
        ...payload,
      };
  }
};

export type PreloadedCoreFields = {
  [key: string]: {
    id: string;
    status: PayloadStatus;
    type?: PaymentsTypes;
    external_id?: string;
  };
};

type ExtraServiceItem = {name: string; amount: string | number};

export type FormTypes = {
  [FORM_NAMES.currency]: NestedValue<{label: string; value: string}>;
  [FORM_NAMES.bookingPayment]: string | number;
  [FORM_NAMES.taxesPayment]: string | number;
  [FORM_NAMES.totalPayment]: string | number;
  [FORM_NAMES.amountPaid]: string | number;
  [FORM_NAMES.depositAmount]: string | number;
  [FORM_NAMES.amountDue]: string | number;
  [FORM_NAMES.amountDue]: string | number;
  [FORM_NAMES.extraServices]: NestedValue<ExtraServiceItem[]>;
};

type UseExtraFields = {
  watch: (field: string, defaultValue?: unknown) => unknown;
};

export function useExtraFields({watch}: UseExtraFields) {
  const [extraFields, setExtraFields] = React.useState<ReservationPaymentsPayloadItem[]>(
    [],
  );
  const [extraPaymentsAmount, setExtraPaymentsAmount] = React.useState<null | number>(
    null,
  );

  const extraFieldsForm = watch(`${FORM_NAMES.extraServices}`) as
    | ExtraServiceItem[]
    | undefined;

  React.useEffect(
    function calculateExtraPayments() {
      if (!extraFieldsForm) return;

      const extraPayments = extraFieldsForm
        .map((item) => {
          return item.amount;
        })
        .filter((value) => {
          return Boolean(value);
        })
        .map((value) => {
          return Number(value);
        });

      if (extraPayments.length) {
        const extraPaymentsSum = extraPayments.reduce((acc, number) => {
          return acc + number;
        }, 0);

        setExtraPaymentsAmount(extraPaymentsSum);
      } else {
        setExtraPaymentsAmount(null);
      }
    },
    [extraFieldsForm, watch],
  );

  const addExtraField = () =>
    setExtraFields((prevState) => {
      const newState = [
        ...prevState,
        {
          id: (Math.random() * 1e6).toString(),
          status: PayloadStatus.ENABLED,
          type: PaymentsTypes.EXTRA_SERVICE,
          name: '',
          amount: '',
        },
      ];

      return newState;
    });

  const removeExtraField = (index: number) =>
    setExtraFields((prevState) => {
      const copyState = [...prevState];
      copyState.splice(index, 1);
      return copyState;
    });

  return {
    extraFields,
    setExtraFields,
    addExtraField,
    removeExtraField,
    extraPaymentsAmount,
  };
}

export function convertToNumbersArray(array: (string | number)[]) {
  return array.map((num) => {
    if (typeof num === 'string') {
      return parseFloat(num);
    }

    return num;
  });
}

export function calc(numbers: number[]) {
  return numbers.reduce((acc: number, num) => {
    return acc + num;
  }, 0);
}

export function calculateFees(amount: number, percent: number) {
  return +((amount / (100 - percent)) * percent).toFixed(2);
}

type PreparedPayments = {
  amount: number;
  fees: boolean;
};

type UsePreparePayments = {
  bookingPayment: number | null;
  extraPaymentsAmount: number | null;
  taxesPayment: number | null;
  isGuestPayingPaymentsFees: boolean;
  isGuestPayingTaxesFees: boolean;
};

export const usePreparePayments = ({
  bookingPayment,
  extraPaymentsAmount,
  taxesPayment,
  isGuestPayingPaymentsFees,
  isGuestPayingTaxesFees,
}: UsePreparePayments) => {
  const [paymentsToCalc, setPaymentsToCalc] = React.useState<PreparedPayments[]>([]);

  React.useEffect(
    function preparePaymentsToCalc() {
      const payments = [
        {amount: bookingPayment, fees: isGuestPayingPaymentsFees},
        {amount: extraPaymentsAmount, fees: isGuestPayingPaymentsFees},
        {amount: taxesPayment, fees: isGuestPayingTaxesFees},
      ].filter((payment) => payment.amount !== null) as PreparedPayments[];

      setPaymentsToCalc(payments);
    },
    [
      bookingPayment,
      extraPaymentsAmount,
      taxesPayment,
      isGuestPayingPaymentsFees,
      isGuestPayingTaxesFees,
    ],
  );

  return {payments: paymentsToCalc};
};

type UseTotalPayment = {
  setValue: any;
  payments: PreparedPayments[];
  feesAmount: number | undefined;
  isAnyFees: boolean;
};

export const useTotalPayment = ({
  setValue,
  payments,
  feesAmount,
  isAnyFees,
}: UseTotalPayment) => {
  React.useEffect(
    function handleTotalPayment() {
      if (!feesAmount) return;

      const result = payments.reduce((acc, {amount}) => acc + amount, 0);

      if (isAnyFees) {
        let fees = payments
          .filter(({fees}) => fees)
          .reduce((acc, {amount}) => {
            const fee = calculateFees(amount, feesAmount);
            return acc + fee;
          }, 0);

        let totalPayment = result + fees;

        setValue(FORM_NAMES.subtotal, result.toFixed(2));
        setValue(FORM_NAMES.transactionFee, fees.toFixed(2));
        setValue(FORM_NAMES.totalPayment, totalPayment.toFixed(2));
      } else {
        setValue(FORM_NAMES.totalPayment, result.toFixed(2));
      }
    },
    [setValue, feesAmount, isAnyFees, payments],
  );
};
