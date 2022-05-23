import styled, {css} from 'styled-components';
import splashBackgroundImage from '../../assets/splash-background.png';
import splashBackground2xImage from '../../assets/splash-background@2x.png';
import splashBackgroundMobile from '../../assets/background-mobile-onlinecheckin.png';
import splashBackground2xMobile from '../../assets/background-mobile-onlinecheckin@2x.png';
import {device} from '../../styled/device';

type WrapperProps = {
  visible: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: fixed;
  height: 100%;
  width: 100%;
  visibility: visible;
  text-align: center;
  background-image: url(${splashBackground2xImage});
  background-size: cover;
  background-repeat: no-repeat;
  background-color: #00429a;
  animation-fill-mode: forwards;
  background-position: center;
  cursor: default;
  z-index: 999999;

  ${props =>
    !props.visible &&
    css`
      animation-name: fadeOut;
      animation-duration: 2s;
      pointer-events: none;
    `};

  @keyframes fadeOut {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
      visibility: hidden;
    }
  }

  @media (max-width: ${device.laptop}) {
    background-image: url(${splashBackgroundImage});
  }

  @media (max-width: ${device.mobileL}) {
    background-image: url(${splashBackground2xMobile});
  }

  @media (max-width: ${device.mobileS}) {
    background-image: url(${splashBackgroundMobile});
  }
`;

export const Logo = styled.img`
  margin-top: 225px;
  width: 180px;
  height: 95px;
  margin-bottom: -22px;
  margin-left: -2px;

  @media (max-width: ${device.tablet}) {
    margin-top: 286px;
  }

  @media (max-width: ${device.mobileM}) {
    margin-top: 250px;
  }

  @media (max-width: ${device.mobileS}) {
    margin-top: 190px;
  }
`;

export const LogoLabel = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 18px;
  text-align: center;
  color: #ffffff;
`;
