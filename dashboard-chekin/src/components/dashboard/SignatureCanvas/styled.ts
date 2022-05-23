import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';
import ModalButton from '../ModalButton';

export const Wrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  position: relative;
`;

export const SignatureWrapper = styled.div`
  display: inline-flex;
  width: 250px;
  height: 174px;
  border: 1px solid #385cf8;
  border-radius: 4px;
  box-shadow: 0 16px 16px #2699fb12;
  box-sizing: border-box;
  justify-content: center;
  cursor: pointer;

  @media (max-width: ${DEVICE.mobileS}) {
    overflow: hidden;
  }
`;

export const SignaturePlaceholder = styled(SignatureWrapper)`
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  background-color: #c4e6ff;
  padding: 41px 0 44px;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
`;

export const SignatureIcon = styled.img`
  width: 37px;
  height: 41px;
  opacity: 0.55;
  user-select: none;
`;

export const SignatureText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  color: #385cf8;
  opacity: 0.55;
  user-select: none;
  text-align: center;
  text-transform: uppercase;
  max-width: 154px;
  margin: 0 auto;
  word-wrap: break-word;
`;

type ClearButtonWrapperProps = {
  visible?: boolean;
};

export const ClearButtonWrapper = styled.div<ClearButtonWrapperProps>`
  text-align: right;
  visibility: ${(props) => !props.visible && 'hidden'};
`;

export const ClearButton = styled(ModalButton)`
  min-width: 70px;
  height: 30px;
  margin-top: 9px;
  border-radius: 2px;
  font-size: 12px;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  margin-left: auto;
  text-align: right;
  padding: 2px 2px 2px 10px;

  &:hover {
    opacity: 0.88;
  }

  &:active {
    opacity: 1;
  }
`;
