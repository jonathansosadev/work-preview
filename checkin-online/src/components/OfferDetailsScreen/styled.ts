import styled from 'styled-components';
import {device} from '../../styled/device';

export const offerMobileLayoutBreakpoint = '930px';

export const OfferColumn = styled.div`
  padding-right: 36px;
  border-right: 1px solid rgba(151, 151, 186, 0.16);

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    padding: 0;
    border: none;
  }
`;

export const BookOfferColumn = styled.div`
  padding-left: 36px;

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    padding: 0;
  }

  @media (max-width: ${device.mobileL}) {
    box-sizing: border-box;
    padding: 0 20px;
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 1fr 1fr;
  padding: 45px 50px 15px;

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    display: flex;
    flex-direction: column;
    align-items: center;

    ${BookOfferColumn}, ${OfferColumn} {
      width: 70%;
    }
  }

  @media (max-width: ${device.tablet}) {
    ${BookOfferColumn}, ${OfferColumn} {
      width: 90%;
    }
  }

  @media (max-width: ${device.mobileL}) {
    padding: 0 0 20px;
    margin-top: -35px;

    ${BookOfferColumn}, ${OfferColumn} {
      width: 100%;
    }
  }

  @media (max-width: ${device.mobileM}) {
  }
`;

export const OfferImage = styled.div<{backgroundURL: string}>`
  width: 100%;
  height: 229px;
  background: url(${props => props.backgroundURL}) center;
  background-size: cover;
  margin-bottom: 16px;
  border-radius: 6px;

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    height: 262px;
  }

  @media (max-width: ${device.mobileL}) {
    border-radius: 0;
  }
`;

export const OfferTitle = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 24px;

  @media (max-width: ${device.mobileL}) {
    padding: 0 20px;
  }
`;

export const OfferDescription = styled.div`
  font-size: 16px;
  color: #161643;
  font-family: ProximaNova-Regular, sans-serif;

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    font-size: 20px;
    margin: 13px auto;
    padding-bottom: 13px;
    border-bottom: 1px solid rgba(151, 151, 186, 0.16);
  }

  @media (max-width: ${device.mobileL}) {
    margin: 13px 20px;
  }
`;

export const LoaderWrapper = styled.div`
  grid-column: 1 / 3;
  justify-self: center;
  margin-top: 200px;
`;

export const TermsAndConditionsWrapper = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 13px;
  color: #161643;
  margin-bottom: 30px;

  a {
    text-decoration: none;
    color: #002aed;
  }

  @media (max-width: ${device.mobileL}) {
    font-size: 16px;
    text-align: center;
  }
`;
