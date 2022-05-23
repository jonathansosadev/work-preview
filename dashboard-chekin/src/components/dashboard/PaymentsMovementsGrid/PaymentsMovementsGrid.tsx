import React from 'react';
import moment from 'moment';
import {useTranslation} from 'react-i18next';
import i18n from '../../../i18n';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {
  PaymentMovement,
  PaymentMovementType,
  PaymentsMovements,
  PaymentType,
} from '../../../utils/types';
import {CapitalizeWrapper} from '../../../styled/common';
import {
  GridHeader,
  GridRow,
  GuestName,
  HousingName,
  InfoColumn,
  PaymentTypeStyled,
  Total,
  Wrapper,
} from './styled';

function getMovementAmount(movement: PaymentMovement) {
  const isMoveTypeRefundOrWriteOff =
    movement.type === PaymentMovementType.refund ||
    movement.type === PaymentMovementType.writeOff;

  if (isMoveTypeRefundOrWriteOff) {
    return -movement.amount;
  }
  return movement.amount_without_taxes || movement.amount;
}

function getMovementDate(date: string, isPreviewMode: boolean) {
  const movementDate = moment(date, 'YYYY-MM-DD').startOf('day');
  const today = moment().startOf('day');
  const yesterday = today.clone().subtract(1, 'day');

  if (isPreviewMode && movementDate.isSame(today, 'day')) {
    return i18n.t('today');
  }

  if (isPreviewMode && movementDate.isSame(yesterday, 'day')) {
    return i18n.t('yesterday');
  }

  return movementDate.format('DD-MM-YYYY');
}

function getMovementPaymentType(movement: PaymentMovement) {
  const paymentType = movement.payment_type;
  if (paymentType === PaymentType.reservationSecurityDeposit) {
    return i18n.t('deposit_charge_type');
  }
  return i18n.t('booking_payment_and_tourist_taxes');
}

function calcTotalAmountMovementItem(movementItem: PaymentMovement[]) {
  const sum = movementItem.reduce((acc, move) => {
    const moveAmount = getMovementAmount(move);
    acc = (acc * 100 + moveAmount * 100) / 100;
    return acc;
  }, 0);
  return sum;
}

type PaymentsInvoicesGridProps = {
  isPreviewMode: boolean;
  movements?: PaymentsMovements;
  className?: string;
};

function PaymentsMovementsGrid({
  movements,
  isPreviewMode,
  className,
}: PaymentsInvoicesGridProps) {
  const {t} = useTranslation();
  const {paymentSettingsCurrencyOnlySymbol} = usePaymentSettings();

  const isArrayEmpty = (arr: Array<any>) => {
    return arr.length === 0;
  };

  const memoizedMovements = React.useMemo(() => {
    if (!movements) {
      return null;
    }

    if (Object.values(movements).every(isArrayEmpty)) {
      return null!;
    }

    return Object.keys(movements).map((date) => {
      return (
        <div key={date}>
          <GridHeader>
            <div>{getMovementDate(date, isPreviewMode)}</div>
            <Total>
              {calcTotalAmountMovementItem(movements[date])}{' '}
              {paymentSettingsCurrencyOnlySymbol}
            </Total>
          </GridHeader>
          {movements[date].map((movement) => {
            if (movement.type === PaymentMovementType.writeOff) {
              return (
                <GridRow key={movement.id}>
                  <InfoColumn>
                    <HousingName>
                      <CapitalizeWrapper>
                        {t('transfer_to_your_bank_account')}
                      </CapitalizeWrapper>
                    </HousingName>
                  </InfoColumn>
                  <div>
                    -{movement.amount} {paymentSettingsCurrencyOnlySymbol}
                  </div>
                </GridRow>
              );
            }

            if (movement.type === PaymentMovementType.refund) {
              return (
                <GridRow key={movement.id}>
                  <InfoColumn>
                    <HousingName>
                      <CapitalizeWrapper>{t('refund_to_the_guest')}</CapitalizeWrapper>
                    </HousingName>
                  </InfoColumn>
                  <div>
                    -{movement.amount} {paymentSettingsCurrencyOnlySymbol}
                  </div>
                </GridRow>
              );
            }

            return (
              <GridRow key={movement.id}>
                <InfoColumn>
                  <HousingName>
                    <CapitalizeWrapper>
                      {movement?.housing_name?.toLowerCase()}
                    </CapitalizeWrapper>
                  </HousingName>
                  {movement.payment_type && (
                    <PaymentTypeStyled>
                      {getMovementPaymentType(movement)}
                    </PaymentTypeStyled>
                  )}
                  {movement.guest_name && <GuestName>{movement.guest_name}</GuestName>}
                </InfoColumn>
                <div>
                  {movement.amount_without_taxes || movement.amount}{' '}
                  {paymentSettingsCurrencyOnlySymbol}
                </div>
              </GridRow>
            );
          })}
        </div>
      );
    });
  }, [isPreviewMode, movements, paymentSettingsCurrencyOnlySymbol, t]);

  return <Wrapper className={className}>{memoizedMovements}</Wrapper>;
}

export {PaymentsMovementsGrid};
