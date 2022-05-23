import styled from 'styled-components';
import {device} from '../../styled/device';

type LanguageOption = {
  $active: boolean;
};

export const LanguageItem = styled.div<LanguageOption>`
  font-family: ${props => (props.$active ? 'ProximaNova-Bold' : 'ProximaNova-Medium')},
    sans-serif;
  padding: 17px 0 17px 0;
  font-size: 14px;
  color: #161643;
  margin-right: 11px;
  border-bottom: 1px solid rgb(239 239 242);

  @media (max-width: ${device.tablet}) {
    font-size: 16px;
  }
`;

export const LanguageMenuContainer = styled.div`
  width: 200px;
  box-sizing: border-box;
  max-height: 305px;
  background-color: white;
  box-shadow: 0 5px 5px #2699fb1a;
  border-radius: 6px;
  position: absolute;
  right: 9px;
  top: 100%;
  overflow-y: scroll;
  padding: 15px 24px 15px 22px;
  text-align: left;

  & ${LanguageItem}:last-child {
    border: none;
  }

  @media (max-width: ${device.tablet}) {
    width: 230px;
  }
`;

export const LanguageCountryIcon = styled.img`
  width: 38px;
  height: 38px;
  margin: -6px 8px -16px -8px;
`;
