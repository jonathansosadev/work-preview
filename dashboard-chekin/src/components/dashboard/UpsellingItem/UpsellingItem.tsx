import React from 'react';
import {useTranslation} from 'react-i18next';
import {CURRENCIES_SYMBOL} from '../../../utils/constants';
import {Deal} from '../../../utils/upselling/types';
import Button from '../Button';
import {
  List,
  Title,
  LiItem,
  GroupButtons,
  Container,
  TitleLastItem,
  BlockContent,
  ContainerUpsellingLastItem,
  AnimatedButtonStyled,
  LoaderTotalRevenueStyled,
  SubtitleLastItem,
  Currency,
} from './styled';

type UpsellingItemProps = {
  title: string;
  deals?: Deal[];
  buttons?: boolean;
  onApprove?: (dealId: string) => void;
  onReject?: (dealId: string) => void;
};

function UpsellingItem({
  title,
  deals,
  onApprove,
  onReject,
  buttons = false,
}: UpsellingItemProps) {
  const {t} = useTranslation();
  return (
    <Container>
      <Title>{title}</Title>
      <List>
        {deals?.map((deal) => (
          <LiItem key={deal.id}>
            <span>{deal.offer.title}</span>
            {buttons && (
              <GroupButtons>
                <AnimatedButtonStyled
                  onClick={() => onApprove?.(deal.id)}
                  label={t('approve')}
                />
                <Button
                  onClick={() => onReject?.(deal.id)}
                  label={t('reject')}
                  danger
                  outlined
                />
              </GroupButtons>
            )}
          </LiItem>
        ))}
      </List>
    </Container>
  );
}

type UpsellingLastItemProps = {
  title: string;
  totalRevenue?: number;
  currency?: string;
  loading?: boolean;
};

function UpsellingLastItem({
  title,
  loading,
  totalRevenue = 0,
  currency = CURRENCIES_SYMBOL.eur,
}: UpsellingLastItemProps) {
  return (
    <ContainerUpsellingLastItem>
      <TitleLastItem>{title}</TitleLastItem>
      {loading ? (
        <LoaderTotalRevenueStyled />
      ) : (
        <BlockContent>
          <SubtitleLastItem>
            {totalRevenue}
            <Currency>{currency}</Currency>
          </SubtitleLastItem>
        </BlockContent>
      )}
    </ContainerUpsellingLastItem>
  );
}

export {UpsellingItem, UpsellingLastItem};
