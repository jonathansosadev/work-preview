import React from 'react';
import {
  Content,
  AltButtonArea,
  ButtonArea,
  StepsArea,
  FooterContent,
  FooterButton,
} from './styled';

type FooterProps = {
  altButton?: {
    text?: string;
    props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    render?: React.ReactNode;
  };
  button?: {
    text?: string;
    props?: React.ButtonHTMLAttributes<HTMLButtonElement>;
    render?: React.ReactNode;
  };
  steps?: number;
  className?: string;
};

function Footer({altButton, button, steps, className}: FooterProps) {
  const buttonElement = button?.render ? (
    button.render
  ) : (
    <FooterButton label={button?.text} {...button?.props} />
  );
  const altButtonElement = altButton?.render ? (
    altButton.render
  ) : (
    <FooterButton secondary label={altButton?.text} {...altButton?.props} />
  );

  return (
    <FooterContent className={className}>
      <StepsArea>{steps}</StepsArea>
      <AltButtonArea>{altButtonElement}</AltButtonArea>
      <ButtonArea>{buttonElement}</ButtonArea>
    </FooterContent>
  );
}

type ContentTileProps = {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
};

function ContentTile({children, className, footer}: ContentTileProps) {
  return (
    <Content className={className}>
      {children}
      {footer}
    </Content>
  );
}

export {ContentTile, Footer};
