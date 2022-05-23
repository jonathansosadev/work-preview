import React from 'react';
import {Trans, useTranslation} from 'react-i18next';

function PaymentsTooltip({currencyLabel, title}: {currencyLabel: string; title: string}) {
  const {t} = useTranslation();

  return (
    <div>
      {title}
      <Trans i18nKey="payments_tooltip" values={{currencyLabel}}>
        <p>
          <b>Stripe</b>
          <br />
          • 1% per transaction
          <br />
          Note: Our fee is additional to the fee that stripe charges for the transactions.
          <br />
        </p>
        You have the option to charge the fee to the guest if you prefer.
      </Trans>
      <br />
      <br />
      <a href={t('payments_tooltip_link')} rel="noreferrer" target="_blank">
        {t('learn_more')}
      </a>
    </div>
  );
}

export {PaymentsTooltip};
