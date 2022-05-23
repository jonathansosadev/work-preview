import styled from 'styled-components';
import TabLinks from '../TabLinks';
import {device} from '../../styled/device';

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: default;
  padding: 38px 60px 29px;

  @media (max-width: ${device.mobileL}) {
    margin-top: -30px;
    padding: 0 30px 15px;
  }
`;

export const HeaderTitle = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 18px;
`;

export const OffersGrid = styled.div`
  max-height: 396px;
  display: grid;
  grid-template-columns: repeat(auto-fit, 246px);
  grid-auto-rows: 162px;
  grid-gap: 15px;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 20px 60px;
  box-sizing: border-box;

  &::after {
    content: '';
    height: 1px;
    grid-column: span 3;

    @media (max-width: ${device.laptop}) {
      grid-column: span 3;
    }
  }

  @media (max-width: 836px) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    &::after {
      display: none;
    }
  }

  @media (max-width: ${device.mobileL}) {
    padding: 0;
    grid-gap: 0;
    max-height: calc(100vh - 211px);
  }
`;

export const LoaderWrapper = styled.div`
  margin-top: 20%;
  display: flex;
  justify-content: center;
`;

export const RequestOfferSuccessModalWrapper = styled.div`
  img {
    height: 106px;
    width: 106px;
  }

  button {
    margin: auto auto 40px;
  }
`;

export const StyledTabLinks = styled(TabLinks)`
  @media (max-width: ${device.mobileL}) {
    .menu {
      right: -20px;
    }
  }
`;
