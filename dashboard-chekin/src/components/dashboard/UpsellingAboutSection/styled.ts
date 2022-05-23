import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';
import {Link} from 'react-router-dom';

export const Content = styled.div`
  display: grid;
  grid-template-areas: 'about preview';
  grid-template-columns: 1fr 285px;
  padding-bottom: 22px;
  cursor: default;
`;

export const AboutArea = styled.div`
  grid-area: about;
`;

export const PreviewArea = styled.div`
  grid-area: preview;
  justify-self: flex-end;
`;

export const AboutUpsellingText1 = styled.div`
  margin-top: -15px;
  margin-bottom: 25px;
  font-size: 15px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #6b6b95;

  > b {
    font-weight: normal;
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const AboutUpsellingText2 = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-bottom: 12px;
`;

export const AboutUpsellingText3 = styled(AboutUpsellingText1)`
  margin-top: 0;
  margin-bottom: 25px;
`;

export const AboutUpsellingText4 = styled(AboutUpsellingText1)`
  margin-bottom: 20px;
`;

export const HowItWorksText = styled.div`
  font-size: 16px;
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  margin-bottom: 16px;
`;

export const HowItWorksLink = styled(Link)`
  color: #002cfa;
  font-family: ProximaNova-Semibold, sans-serif;
  padding: 0 25px;
  border-left: 1px solid rgb(210 211 225);
  height: 25px;
  text-decoration: none;

  &:hover {
    opacity: 0.7;
  }

  @media (max-width: ${DEVICE.yFullHD}) {
    border: none;
    padding-left: 0;
    text-align: right;
    height: auto;
  }
`;

export const HowItWorksItemsContainer = styled.div`
  display: flex;
  margin-bottom: 25px;

  & ${HowItWorksLink}:first-child {
    border-left: none;
    padding-left: 0;
  }
`;

export const HowItWorksIcon = styled.img`
  margin-right: 7px;
  margin-top: -1px;
  vertical-align: middle;
`;

export const TourIcon = styled(HowItWorksIcon)`
  margin-top: -4px;
`;

export const Divider = styled.div`
  height: 1px;
  background: rgb(225 225 231);
  width: 100%;
  margin-bottom: 25px;
`;

export const OfferTileName = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #6b6b95;
  margin-top: 13px;
  text-align: center;
`;
