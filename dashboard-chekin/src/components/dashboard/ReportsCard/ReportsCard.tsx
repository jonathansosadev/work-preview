import React from 'react';
import {ButtonProps} from '../Button/Button';
import {
  StyledCard,
  Header,
  Title,
  Body,
  BodyImage,
  BodyCount,
  BodySubTitle,
  CardButton,
  BodyImageWrapper,
} from './styled';

export type ReportsCardProps = {
  title: string;
  content?: {
    image?: React.ImgHTMLAttributes<HTMLImageElement>;
    count?: string;
    subtitle?: string;
  };
  button?: ButtonProps;
  loading?: boolean;
};

function ReportsCard({title, content, button, loading}: ReportsCardProps) {
  return (
    <StyledCard $loading={Boolean(loading)}>
      <Header>{title && <Title>{title}</Title>}</Header>
      <Body>
        {content?.image && (
          <BodyImageWrapper>
            <BodyImage {...content.image} />
          </BodyImageWrapper>
        )}
        {content?.count && <BodyCount>{content?.count}</BodyCount>}
        {content?.subtitle && <BodySubTitle>{content?.subtitle}</BodySubTitle>}
      </Body>
      {button && <CardButton {...button} />}
    </StyledCard>
  );
}

export {ReportsCard};
