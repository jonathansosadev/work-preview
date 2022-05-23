import styled from 'styled-components';
import {BaseButton} from '../../styled/common';
import Button from '../Button';
import {device} from '../../styled/device';
import {GUEST_STATUSES} from './FinishScreen';

export const GuestsWrapper = styled.div`
  max-width: 320px;
  margin: 0 auto 50px;
  color: #161643;
  font-family: ProximaNova-Light, sans-serif;
  cursor: default;
  padding: 0 20px;
  border-bottom: 1px solid rgba(45, 80, 142, 0.1);

  @media (max-width: ${device.mobileS}) {
    width: 300px;
  }
`;

export const GuestsTitle = styled.div`
  font-size: 20px;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  margin-bottom: 28px;
`;

export const GuestsCount = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  color: #9696b9;
`;

export const GuestsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 5px;
`;

type GuestProps = {
  status: string;
};

export const Guest = styled.div<GuestProps>`
  padding-left: 22px;
  position: relative;
  margin-bottom: 29px;
  font-size: 20px;
  text-transform: capitalize;
  font-family: ProximaNova-Light, sans-serif;
  display: inline-block;

  &:before {
    content: '';
    background-color: ${getStatusDotColor};
    border-radius: 50%;
    height: 8px;
    width: 8px;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    position: absolute;
  }

  & > b {
    font-family: ProximaNova-Semibold, sans-serif;
    word-break: break-all;
  }

  @media (max-width: ${device.tablet}) {
    font-size: 20px;
  }
`;

export const GuestPlaceholder = styled(Guest)`
  color: #9696b9;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  text-transform: initial;

  & > span {
    margin-right: 10px;
  }
`;

function getStatusDotColor({status = ''}) {
  if (status === GUEST_STATUSES.incomplete) {
    return '#ffc400';
  }

  if (status === GUEST_STATUSES.error) {
    return '#ff5d8f';
  }

  if (status === GUEST_STATUSES.complete) {
    return '#35E5BC';
  }

  return '#0081ec';
}

export const ExpandingGuestsButton = styled(BaseButton)`
  color: #1a8cff;
  font-size: 14px;
  font-family: ProximaNova-Semibold, sans-serif;
  padding-left: 22px;
  text-transform: uppercase;
  padding-bottom: 20px;

  @media (max-width: ${device.tablet}) {
    font-size: 17px;
  }
`;

export const MobileHeaderIcon = styled.img`
  width: 29px;
  height: 24px;
`;

export const TitleText = styled.div`
  text-align: center;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 25px;
  padding: 0 10px;
  cursor: default;
  max-width: 548px;
  margin: 55px auto 46px;

  & > b {
    font-weight: normal;
    font-family: ProximaNova-Semibold, sans-serif;
  }

  & > img {
    margin-right: 15px;
    vertical-align: middle;
  }
`;

export const RegisterButton = styled(Button)`
  height: 33px;
  font-family: ProximaNova-Semibold, sans-serif;
  display: inline-flex;
  font-size: 12px;
  justify-content: center;
  min-width: auto;
  padding: 0 15px;
  vertical-align: middle;

  .label {
    padding: 0;
    border: none;
  }
`;

export const BottomText = styled.div`
  text-align: center;
  max-width: 548px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  color: #161643;
  padding: 0 10px;
  margin: 32px auto 20px;
  cursor: default;
`;

export const BottomButton = styled(BaseButton)`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  text-transform: uppercase;
  color: #1a8cff;
  padding: 5px;
`;

export const Or = styled(BottomText)`
  margin: 15px auto;
`;

export const BottomWrapper = styled.div`
  text-align: center;
  padding-bottom: 50px;
`;

export const ExploreButton = styled(Button)`
  height: 33px;
  font-family: ProximaNova-Semibold, sans-serif;
  display: inline-flex;
  font-size: 12px;
  justify-content: center;
  min-width: auto;
  padding: 0 15px;
  vertical-align: middle;
  border-radius: 16.5px;
  margin-bottom: 15px;

  .label {
    padding: 0;
    border: none;
  }
`;

export const NotNowButton = styled(Button)`
  height: 33px;
  font-family: ProximaNova-Semibold, sans-serif;
  display: inline-flex;
  font-size: 12px;
  justify-content: center;
  min-width: auto;
  padding: 0 15px;
  vertical-align: middle;
  border-radius: 16.5px;
  background: #ffffff;
  color: #000000;
  margin-bottom: 15px;

  .label {
    padding: 0;
    border: none;
  }
`;
