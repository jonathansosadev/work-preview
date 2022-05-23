import styled, {css} from 'styled-components';
import {Status} from '../utils/types';
import {DEVICE} from 'styled/device';
import Button from '../components/dashboard/Button';
import {TableDivRow} from '../components/dashboard/TablePlaceholder/styled';
import {footerHeight} from '../components/dashboard/Footer';
import {ContentWrapper as TooltipContentWrapper} from '../components/dashboard/Tooltip/styled';

export const ACCOUNT_MAIN_WIDTH = 896;

export const AppContainer = styled.div`
  min-height: calc(100vh - ${footerHeight});
`;

export const ErrorMessage = styled.div<{textAlign?: 'left' | 'right'}>`
  text-align: ${(props) => props.textAlign || 'right'};
  font-family: ProximaNova-Semibold, sans-serif;
  color: #ff2467;
  font-size: 12px;
  margin-top: 3px;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 30px;

  &:first-child {
    margin-top: 30px;
  }
`;

export const CapitalizeWrapper = styled.div`
  word-break: break-all;
  text-transform: capitalize;
`;

type SaveButtonProps = {
  status: Status;
};

export const SaveButton = styled(Button)<SaveButtonProps>`
  transition: all 0.1s ease-out;

  ${(props) =>
          props.status &&
          css`
            justify-content: center;
          `};

  ${(props) =>
          props.disabled &&
          css`
            opacity: 1;
            cursor: default;

            &:hover {
              opacity: 1;
            }
          `};

  ${(props) =>
          props.status === 'error' &&
          css`
            background-color: #ff2467;
            border-color: #ff2467;
          `};

  &:hover {
    opacity: 1;
  }
`;

export const ResolveButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  color: #385cf8;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const ModalButtonWrapper = styled.div`
  text-align: center;
  margin-bottom: 52px;
  margin-top: -20px;
`;

export const ModalTwoButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
  margin-top: 65px;
  height: 125px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const MissingDataText = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 14px;
  color: #9696b9;
`;

export const TableHeader = styled.div`
  display: inline-flex;
  align-items: center;
`;

export const ContentWrapper = styled.div`
  max-width: ${DEVICE.yFullHD};
  margin: 21px auto 0;
  cursor: default;
  padding: 0 120px 97px;
`;

export const TableContentWrapper = styled.div`
  max-width: ${DEVICE.yFullHD};
  padding: 0 20px 30px;
  margin: 30px auto 0;
`;

export const Heading = styled.div`
  width: 100%;
  margin-top: 32px;
  display: grid;
  align-items: flex-end;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 10px;

  & > :nth-child(2) {
    overflow: hidden;
    text-align: center;
    align-self: center;
  }

  & > :nth-child(3) {
    display: flex;
    justify-content: flex-end;
  }
`;

type DocumentButtonProps = {
  disabled?: boolean;
  blinking?: boolean;
  blinkingBackwards?: boolean;
};
export const SmallButton = styled.button<DocumentButtonProps>`
  outline: none;
  cursor: pointer;
  width: 61px;
  min-width: 61px;
  height: 22px;
  font-size: 14px;
  border: 1px solid #385cf8;
  border-radius: 2px;
  background-color: white;
  margin-left: auto;
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;

  &:hover {
    opacity: 0.78;
    box-shadow: 0 4px 4px #2148ff1a;
  }

  &:active {
    opacity: 1;
  }

  ${(props) =>
          props.disabled &&
          css`
            &:hover {
              opacity: 1;
              box-shadow: none;
            }

            &:active {
              opacity: 1;
            }
          `};

  ${(props) =>
          props.blinking &&
          css`
            &,
            &:hover,
            &:active {
              cursor: progress;
              animation: blink 3s ease-in-out infinite;
              opacity: 1;
            }
          `};

  ${(props) =>
          props.blinkingBackwards &&
          css`
            &,
            &:hover,
            &:active {
              cursor: progress;
              animation: blink-backwards 3s ease-in-out infinite;
              opacity: 1;
            }
          `};

  @keyframes blink {
    0% {
      border-color: #d7d8e4;
    }
    50% {
      border-color: #385cf8;
    }
    0% {
      border-color: #d7d8e4;
    }
  }

  @keyframes blink-backwards {
    0% {
      border-color: #385cf8;
    }
    50% {
      border-color: #d7d8e4;
    }
    0% {
      border-color: #385cf8;
    }
  }
`;

export const RelativeWrapper = styled.div`
  position: relative;
`;

export const TablePlaceholderWrapper = styled.div`
  & ${TableDivRow}:last-child {
    border-bottom: none;
  }
`;

export const BaseButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  padding: 0;
  cursor: ${(props) => (props.disabled ? 'disabled' : 'pointer')};
  opacity: ${(props) => props.disabled && 0.1};

  ${(props) =>
          !props.disabled &&
          css`
            &:hover {
              opacity: 0.75;
            }

            &:active {
              opacity: 1;
            }
          `}

  ${(props) =>
          props.disabled &&
          css`
            box-shadow: none;
            cursor: not-allowed;
            opacity: 0.1;
          `}
`;

export const BlueSmallLink = styled.a`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  cursor: pointer;
`;

export const HeadingTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 21px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const InfoLink = styled.a`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #385cf8;
  text-decoration: none;
`;

export const LargeTooltipSectionWrapper = styled.div`
  & ${TooltipContentWrapper} {
    width: 350px;
  }
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

export const FirstFormSectionWrapper = styled.div`
  padding-top: 21px;
`;

export const FieldsGridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 293px);
  grid-auto-rows: auto;
  position: relative;
  grid-gap: 20px;

  @media (max-width: 1135px) {
    justify-content: flex-start;
    grid-column-gap: 70px;
  }
`;

export const FieldsVerticalGridLayout = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fit, 70px);
  grid-auto-columns: min-content;
  max-height: 250px;
  grid-gap: 20px 70px;

  @media (max-width: 1380px) {
    max-height: 400px;
  }
`;

export const HeadingSection = styled.div`
  display: flex;
  align-items: center;

  & > div {
    margin-right: 30px;
  }
`;

export const SidebarIcon = styled.img.attrs({alt: ''})`
  vertical-align: middle;
`;

export const Hr = styled.hr`
  border: none;
  height: 1px;
  background: #f1f1f4;
  margin: 35px 0;
`;
