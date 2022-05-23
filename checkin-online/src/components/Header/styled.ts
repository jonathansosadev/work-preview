import React from 'react';
import styled, {css} from 'styled-components';
import {device} from '../../styled/device';

type HeaderMarginProps = {
  height?: number | null;
};

export const HeaderMargin = styled.div<HeaderMarginProps>`
  height: ${props => props.height || 60}px;
  z-index: 0;
  margin-bottom: 55px;

  @media (max-width: ${device.tablet}) {
    height: ${props => props.height || 73}px;
  }
`;

type HeaderContainerProps = {
  ref: React.RefObject<HTMLDivElement | null>;
};

export const HeaderContainer = styled.div<HeaderContainerProps>`
  background: transparent linear-gradient(95deg, #385cf8 0%, #395bf8 47%, #163ae2 100%) 0%
    0% no-repeat padding-box;
  width: 100%;
  min-height: 75px;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
`;

export const HeaderContent = styled.div`
  background: transparent linear-gradient(95deg, #385cf8 0%, #395bf8 47%, #163ae2 100%) 0%
    0% no-repeat padding-box;
  width: 100%;
  position: relative;
  min-height: 75px;

  @media (max-width: ${device.tablet}) {
    min-height: 73px;
    display: flex;
    height: auto;
  }
`;

export const ChekinLogo = styled.img`
  position: absolute;
  top: -2px;
  left: 24px;
  width: 112px;
  height: 36px;
  bottom: 0;
  margin: auto 0;

  @media (max-width: ${device.laptop}) {
    display: none;
  }
`;

export const HeaderTitleWrapper = styled.div`
  flex: 1;

  @media (max-width: ${device.tablet}) {
    min-height: 75px;
  }
`;

type HeaderTitleProps = {
  centerContent?: boolean;
};

export const HeaderTitle = styled.div<HeaderTitleProps>`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 18px;
  color: white;
  margin: 0 auto;
  padding: 15px 0 0;
  text-align: center;
  cursor: default;
  display: flex;
  position: relative;
  user-select: none;
  justify-content: center;
  max-width: 1280px;
  z-index: 0;

  & br {
    display: none;
  }

  @media (max-width: ${device.tablet}) {
    font-size: 19px;
    text-align: left;
    position: static;
    margin: 14px 0 3px;
    padding: 0;
    width: auto;
    justify-content: flex-start;

    & br {
      display: block;
    }
  }

  ${props =>
    props.centerContent &&
    css`
      position: absolute;
      top: -2px;
      bottom: 0;
      margin: auto;
      padding: 0;
      width: 100%;
      align-items: center;
      max-width: unset;

      @media (max-width: ${device.tablet}) {
        align-items: center;
        height: 100%;
        margin: 0;
      }
    `};
`;

export const HeaderSubtitle = styled.div`
  text-align: center;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #ffffff;
  opacity: 1;
  padding-bottom: 13px;
  word-break: break-all;
  padding-top: 5px;
  cursor: default;

  @media (max-width: ${device.tablet}) {
    text-align: left;
    padding-top: 0;
  }
`;

export const MobileHeaderIconContainer = styled.div`
  width: 53px;
  height: auto;
  text-align: center;
  display: none;

  @media (max-width: ${device.tablet}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const StepsContainer = styled.div`
  text-align: left;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  color: #ffffff;
  margin-left: 5px;
`;

export const LanguageButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  padding: 0;
  cursor: pointer;
  width: 38px;
  height: 38px;
  z-index: 999;
  display: inline-flex;
  position: absolute;
  right: 44px;
  align-items: center;
  justify-content: center;
  top: 6px;
  bottom: 0;
  margin: auto 0;

  &:hover > img {
    opacity: 0.8;
  }

  &:active > img {
    opacity: 1;
  }

  > img {
    text-align: center;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 23px;
    color: #ffffff;
    bottom: 0;
  }

  @media (max-width: ${device.tablet}) {
    display: none;
  }
`;

export const MobileLanguageButton = styled(LanguageButton)`
  display: none;

  > img {
    height: auto;
    margin: 9px 20px 0;
  }

  @media (max-width: ${device.tablet}) {
    margin: auto 20px auto 0;
    display: flex;
    position: static;
  }

  @media (max-width: ${device.mobileM}) {
    margin-right: 10px;
  }

  @media (max-width: ${device.mobileS}) {
    margin-right: 0;
  }
`;

export const BackButtonWrapper = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 776px;
  margin: auto;
  display: flex;
  align-items: center;
  z-index: 1;

  @media (max-width: 1110px) {
    left: 64px;
  }

  @media (max-width: ${device.tablet}) {
    display: none;
  }
`;

export const MobileBackButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
  margin-left: 2px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;
