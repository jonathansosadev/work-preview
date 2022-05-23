import styled, {css} from 'styled-components';
import BaseTooltip from '../Tooltip';

export const PremiumServiceName = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  margin-bottom: 3px;
  margin-right: 5px;
  position: relative;
`;

type PremiumServiceButtonProps = {
  isLoading?: boolean;
};

export const EditPremiumServiceButton = styled.button<PremiumServiceButtonProps>`
  outline: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  margin-right: 8px;
  text-align: center;
  background-color: #002CFA;
  padding: 0;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    vertical-align: middle;
    width: 16px;
    height: 16px
  }

  ${(props) =>
    props.disabled &&
    css`
      &,
      &:hover,
      &:active {
        opacity: 0.4;
        cursor: ${props.isLoading ? 'progress' : 'not-allowed'};
    `}
`;

export const DeletePremiumServiceButton = styled.button<PremiumServiceButtonProps>`
  outline: none;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  margin-right: 8px;
  text-align: center;
  background-color: #FF2467;
  padding: 0;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  & > img {
    vertical-align: middle;
    width: 12.14px;
    height: 16px
  }

  ${(props) =>
    props.disabled &&
    css`
      &,
      &:hover,
      &:active {
        opacity: 0.4;
        cursor: ${props.isLoading ? 'progress' : 'not-allowed'};
    `}
`;

type PremiumServiceWrapperProps = {
  blinking?: boolean;
  disabled?: boolean;
};

export const PremiumServiceWrapper = styled.div<PremiumServiceWrapperProps>`
  min-width: 289px;
  min-height: 59px;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 78px;
  align-items: center;
  border: 1px solid rgb(214 214 228);
  border-radius: 3px;
  box-sizing: border-box;
  padding: 10px 4px 10px 20px;
  cursor: default;
  margin-bottom: 10px;

  & > div:nth-child(2) {
    text-align: right;
  }

  ${(props) =>
    props.blinking &&
    css`
      &,
      &:hover,
      &:active {
        animation: blink 5s ease-in-out infinite;
        opacity: 1;
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      &,
      &:hover,
      &:active {
        opacity: 0.3;
        cursor: not-allowed;
      }
    `}
`;

export const NameTooltip = styled(BaseTooltip)`
  display: inline-flex;
`;
