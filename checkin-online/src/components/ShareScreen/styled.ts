import styled from 'styled-components';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  text-align: center;
`;

export const Content = styled.div`
  max-width: 1280px;
  margin: auto;
  padding-bottom: 60px;
  position: relative;

  @media (max-width: ${device.mobileL}) {
    padding-bottom: 150px;
  }
`;

export const MobileHeaderSuccessIcon = styled.img`
  width: 29px;
  height: 24px;
`;

export const ShareImage = styled.img`
  width: 120px;
  height: 97px;
  margin-top: 70px;
`;

export const Title = styled.div`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  margin-top: 55px;
  color: #161643;
  cursor: default;
`;

export const ShareLinkInput = styled.input`
  height: 25px;
  width: 246px;
  text-align: left;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 21px;
  padding: 5px;
  overflow: hidden;
  border: 0;
  border-bottom: 1px solid #ced7e5;
  outline: none;
  margin: 30px auto 0;
  color: #1a8cff;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const CopyButton = styled.button`
  border: none;
  outline: none;
  min-width: 121px;
  height: 35px;
  padding: 0 25px;
  box-sizing: border-box;
  background-color: #2194f7;
  box-shadow: 0 11px 11px #0c273e29;
  border-radius: 2px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.07s ease-in-out;

  &:hover {
    opacity: 0.95;
  }

  &:active {
    opacity: 1;
  }
`;

export const CopyButtonWrapper = styled.div`
  text-align: center;
  margin-top: 16px;
`;

export const Dot = styled.div`
  width: 10px;
  height: 10px;
  background-color: #eeeeee;
  border-radius: 50%;
`;

export const ThreeDotsGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 42px auto 33px;

  & ${Dot}:nth-child(2) {
    margin: 0 21px;
  }
`;

export const AltShareTitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  color: #161643;
  cursor: default;
`;

type ShareLinkBlockProps = {
  label: string;
};

const ShareLinkBlock = styled.div<ShareLinkBlockProps>`
  width: 52px;
  height: 52px;
  box-shadow: 0 10px 10px #2699fb1a;
  border-radius: 6px;
  text-align: center;
  position: relative;
  user-select: none;
  cursor: pointer;

  & > div {
    position: absolute;
    bottom: -30px;
    left: 0;
    right: 0;
    margin: auto;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    color: #161643;
  }

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const WhatsappShareLink = styled(ShareLinkBlock)`
  background-color: #1bd741;

  & > img {
    margin-top: 10px;
    height: 32px;
    width: 32px;
    margin-left: 2px;
  }

  & > div {
    left: -17px;
  }
`;

export const EmailShareLink = styled(ShareLinkBlock)`
  background-color: #ff2467;

  & > img {
    margin-top: 15px;
    width: 29px;
    height: 22px;
  }
`;

export const SMSShareLink = styled(ShareLinkBlock)`
  background-color: #0f99ff;

  & > img {
    margin-top: 8px;
    width: 33px;
    height: 33px;
  }
`;

export const ShareLinkButtonsWrapper = styled.div`
  display: flex;
  margin: 35px auto;
  justify-content: space-between;
  max-width: 288px;
  padding: 0 30px;
`;

export const LinkCopiedMessage = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  color: #161643;
  margin-top: 16px;
  height: 35px;
  cursor: default;
`;

export const HousingLogoContainer = styled.div`
  top: 40px;
  left: 53px;
  text-align: center;
  position: absolute;

  @media (max-width: ${device.tablet}) {
    display: none;
  }
`;

export const HousingLogoImage = styled.img`
  max-width: 147px;
  max-height: 120px;
`;
