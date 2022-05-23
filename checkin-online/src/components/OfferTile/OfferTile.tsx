import React from 'react';
import {useTranslation} from 'react-i18next';
import {CURRENCIES_LABELS} from '../../utils/constants';
import backgroundPlaceholder from '../../assets/empty-offer-background.svg';
import {
  Container,
  Description,
  PriceAndButtonContainer,
  Title,
  Price,
  BookButton,
  Content,
  Label,
} from './styled';

export enum OFFER_LABELS {
  selected = 'selected',
  requested = 'requested',
}

type OfferTileProps = {
  title?: string;
  highlight?: string;
  price?: string | number;
  currency?: string;
  background?: string;
  className?: string;
  label?: OFFER_LABELS | '';
  onBook?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const defaultProps: Partial<OfferTileProps> = {
  title: '',
  highlight: '',
  price: '',
  currency: CURRENCIES_LABELS.eur,
  background: '',
  label: '',
};

function OfferTile({
  price,
  currency,
  highlight,
  title,
  background,
  className,
  onBook,
  onClick,
  label,
}: OfferTileProps) {
  const {t} = useTranslation();

  return (
    <Container
      onClick={onClick}
      className={className}
      backgroundURL={background || backgroundPlaceholder}
    >
      {label && <Label value={label}>{t(label)}</Label>}
      <Content>
        <Title>{title || t('title')}</Title>
        <Description>{highlight || t('highlight')}</Description>
        <PriceAndButtonContainer>
          <Price>
            {price || 0}
            <span className="currency"> {currency}</span>
          </Price>
          <BookButton label={t('book')} onClick={onBook} />
        </PriceAndButtonContainer>
      </Content>
    </Container>
  );
}

OfferTile.defaultProps = defaultProps;
export {OfferTile};
