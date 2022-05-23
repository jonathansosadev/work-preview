import React from 'react';
import styled, {css} from 'styled-components';
import {useTranslation} from 'react-i18next';

type InfoLinkProps = {
  grey: boolean;
};

const InfoLink = styled.a<InfoLinkProps>`
  margin-left: 20px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  text-decoration: none;

  ${(props) =>
    props.grey &&
    css`
      display: inline-flex;
      align-self: flex-start;
      align-items: center;
      height: 20px;
      margin-top: 1px;
      color: #9696b9;
    `};
`;

type HowItWorksLinkProps = {
  grey?: boolean;
  link?: string;
};

function HowItWorksLink({grey, link}: HowItWorksLinkProps) {
  const {t} = useTranslation();
  const phrase = t('how_it_works');
  return (
    <InfoLink grey={!!grey} href={link}>
      {grey ? `(${phrase})` : phrase}
    </InfoLink>
  );
}

export {HowItWorksLink};
