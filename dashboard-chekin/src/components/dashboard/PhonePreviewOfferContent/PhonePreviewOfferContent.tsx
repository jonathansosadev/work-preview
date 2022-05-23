import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  StyledOfferTile,
  DescriptionWrapper,
  DescriptionTitle,
  DescriptionText,
  PriceWrapper,
  Title,
  Price,
  StyledButton,
  StyledLink,
  Terms,
} from './styled';

type PhonePreviewContentProps = {
  title?: string;
  description?: string;
  highlight?: string;
  price?: string | number;
  currency?: string;
  backgroundSrc?: string;
};

function PhonePreviewOfferContent({
  title,
  description,
  highlight,
  price,
  currency,
  backgroundSrc,
}: PhonePreviewContentProps) {
  const {t} = useTranslation();

  return (
    <>
      <StyledOfferTile
        showPriceAndButton={false}
        background={backgroundSrc}
        title={title}
        highlight={highlight}
        price={price}
      />
      <DescriptionWrapper>
        <DescriptionTitle>{t('description')}</DescriptionTitle>
        <DescriptionText>{description || t('if_your_room_is_occupied')}</DescriptionText>
        <PriceWrapper>
          <Title>{t('price')}</Title>
          <Price>
            {price}
            <span className="currency">{currency}</span>
          </Price>
        </PriceWrapper>
        <StyledButton label={t('request_this_offer')} />
        <Terms>
          {t('this_offer_is_subject_to_')}
          <StyledLink href={t('terms_and_conditions_link')} target="_blank">
            {t('terms_and_conditions')}
          </StyledLink>
        </Terms>
      </DescriptionWrapper>
    </>
  );
}

export {PhonePreviewOfferContent};
