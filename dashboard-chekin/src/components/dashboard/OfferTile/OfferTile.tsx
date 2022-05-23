import React from 'react';
import {useTranslation} from 'react-i18next';
import {CURRENCIES_LABELS} from '../../../utils/constants';
import backgroundPlaceholder from 'assets/empty-offer-background.svg';
import {
  Container,
  Description,
  PriceAndButtonContainer,
  Title,
  Price,
  BookButton,
  Content,
} from './styled';

type OfferTileProps = {
  title?: string;
  highlight?: string;
  price?: string | number;
  currency?: string;
  background?: string;
  className?: string;
  showPriceAndButton: boolean;
};

const defaultProps: Partial<OfferTileProps> = {
  title: '',
  highlight: '',
  price: '',
  currency: CURRENCIES_LABELS.eur,
  background: '',
};

function OfferTile({
  price,
  currency,
  highlight,
  title,
  background,
  className,
  showPriceAndButton,
}: OfferTileProps) {
  const {t} = useTranslation();

  return (
    <Container className={className} backgroundURL={background || backgroundPlaceholder}>
      <Content>
        <Title>{title || t('title')}</Title>
        <Description>{highlight || t('highlight')}</Description>
        {showPriceAndButton && (
          <PriceAndButtonContainer>
            <Price>
              {price || 0}
              <span className="currency"> {currency}</span>
            </Price>
            <BookButton label={t('book')} />
          </PriceAndButtonContainer>
        )}
      </Content>
    </Container>
  );
}

OfferTile.defaultProps = defaultProps;
export {OfferTile};
