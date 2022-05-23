import React from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {CURRENCIES_LABELS} from '../../../utils/constants';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {FormTypes} from '../OfferDetails/types';
import {
  EXTRA_PRICE_FORM_NAMES,
  FORM_NAMES,
  OfferTemplate,
} from '../../../utils/upselling';
import PhoneMockup from '../PhoneMockup';
import PhonePreviewContent from '../PhonePreviewOfferContent';
import {Title, Header, MenuText} from './styled';

export type OfferPhonePreviewProps = {
  backgroundSrc: string | undefined;
  offerTemplate: OfferTemplate;
};

function OfferPhonePreview({backgroundSrc, offerTemplate}: OfferPhonePreviewProps) {
  const {t} = useTranslation();
  const {watch} = useFormContext<FormTypes>();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {currency: offerTemplateCurrency} = offerTemplate;
  const currency =
    offerTemplateCurrency || paymentSettingsCurrencyLabel || CURRENCIES_LABELS.eur;
  const title = watch(FORM_NAMES.title, t('title') as string);
  const highlight = watch(FORM_NAMES.highlight, t('highlight') as string);
  const feelGuest = watch(EXTRA_PRICE_FORM_NAMES.feeToGuest);
  const prices = watch(FORM_NAMES.pricesItems);

  const description = watch(
    FORM_NAMES.description,
    t('if_your_room_is_occupied') as string,
  );

  const getPrice = () => {
    if (feelGuest) return feelGuest;
    if (!prices?.length) return 0;
    return prices.reduce((sum, itemPrice) => sum + Number(itemPrice?.price || 0), 0);
  };

  return (
    <PhoneMockup>
      <Header>
        <MenuText>{t('menu')}</MenuText>
        <Title>{t('deals_and_experiences')}</Title>
      </Header>
      <PhonePreviewContent
        backgroundSrc={backgroundSrc}
        currency={currency}
        title={title}
        description={description}
        highlight={highlight}
        price={getPrice()}
      />
    </PhoneMockup>
  );
}

export {OfferPhonePreview};
