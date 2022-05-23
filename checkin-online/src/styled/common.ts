import styled, {css} from 'styled-components';
import Button from '../components/Button';

export const RelativeWrapper = styled.div`
  position: relative;
`;

export const DimensionsWrapper = styled.div`
  max-width: 1280px;
  max-height: 720px;
  height: 100%;
  width: 100%;
  margin: auto;
  position: relative;
`;

export const PageContentWrapper = styled.div`
  max-width: 750px;
  margin: auto;
`;

export const CenteredWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

type FormFieldWrapperProps = {
  hasError?: boolean;
};

export const FormFieldWrapper = styled.div<FormFieldWrapperProps>`
  display: inline-block;
  text-align: center;
  margin: 10px 0;
  position: relative;

  ${props =>
    props.hasError &&
    css`
      margin-bottom: 3px;
    `};
`;

export const ErrorMessage = styled.div`
  text-align: right;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #ff2467;
  font-size: 14px;
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
  margin: 0 auto;

  & ${Dot}:nth-child(2) {
    margin: 0 17px;
  }
`;

export const ModalButton = styled(Button)`
  margin: 0 auto 50px;
`;

export const UploadButton = styled(Button)`
  height: auto;
  color: #2699fb;

  &:hover {
    color: #43a9ff;
  }
`;

export const ModalSecondaryButton = styled.button`
  outline: none;
  background-color: transparent;
  border: none;
  margin: 32px auto;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #1a8cff;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const WebcamSubtext = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #86ccff;
  font-size: 18px;
  cursor: default;
  max-width: 310px;
  margin: 10px auto;
`;

export const BaseButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  padding: 0;
  cursor: ${props => (props.disabled ? 'disabled' : 'pointer')};
  opacity: ${props => props.disabled && 0.1};

  ${props =>
    !props.disabled &&
    css`
      &:hover {
        opacity: 0.75;
      }

      &:active {
        opacity: 1;
      }
    `}

  ${props =>
    props.disabled &&
    css`
      box-shadow: none;
      cursor: not-allowed;
      opacity: 0.1;
    `}
`;

export const CapitalizeWrapper = styled.div`
  word-break: break-all;
  text-transform: capitalize;
`;

export const BaseTableWrapper = styled.div`
  width: 100%;
  border-radius: 6px;
  box-shadow: 0 0 10px #2148ff1a;
  overflow-x: auto;
  & > table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    & > thead {
      cursor: default;
      background-color: #ececf8;
      font-family: ProximaNova-Medium, sans-serif;
      font-size: 15px;
      color: #505077;
      font-weight: normal;
      & > tr {
        height: 60px;
        text-align: left;
        & > th {
          font-weight: normal;
        }
      }
    }
    & > tbody > tr {
      font-family: ProximaNova-Semibold, sans-serif;
      font-size: 15px;
      color: #161643;
      height: 48px;
      border-bottom: 1px solid rgb(237 237 240);
      cursor: pointer;
      transition: background-color 0.07s ease-in-out;
      &:hover {
        background-color: #fafaff;
      }
    }
  }
`;
