import styled from 'styled-components';
import {baseContentStyle} from '../Modal';

export const contentStyle = {
  ...baseContentStyle,
  width: 306,
  padding: '0 30px',
  minHeight: 296,
};

export const ExportingText = styled.span`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: white;
  margin-left: 14px;
  margin-right: 15px;
`;

export const RelativeWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const CloseIcon = styled.img`
  position: absolute;
  width: 20px;
  height: 20px;
  right: -15px;
  top: 0;
  margin: auto;
  bottom: 0;
  cursor: pointer;
  border-radius: 3px;
  transition: box-shadow 0.15s ease-in-out;
  box-shadow: 0 10px 10px #2148ff1a;
`;

export const ExportingIcon = styled.img`
  vertical-align: middle;
`;

export const ModalTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  margin-top: 53px;
  text-align: center;
  margin-bottom: 40px;
  cursor: default;
`;

export const ModalButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;

  & > button {
    &:first-child {
      margin-bottom: 20px;
    }

    min-width: 253px;
    height: 53px;
  }
`;
