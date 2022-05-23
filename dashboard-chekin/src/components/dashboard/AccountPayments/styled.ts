import styled, {css} from 'styled-components';
import {PAYMENTS_SETTINGS_STATUSES} from '../../../utils/types';
import {ButtonProps} from '../Button/Button';
import Input from '../Input';
import Button from '../Button';
import Tooltip from '../Tooltip';
import {ContentWrapper as TooltipContentWrapper} from '../Tooltip/styled';
import {
  BaseButton,
  SmallButton,
  LargeTooltipSectionWrapper,
} from '../../../styled/common';

export const Subtitle = styled.div`
  color: rgb(107, 107, 149);
`;

export const BalanceWrapper = styled.div`
  margin: 30px 0 35px;
`;

export const BalanceLabel = styled.div`
  grid-area: balance-label;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 8px;
`;

export const Balance = styled.div`
  display: inline-block;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 36px;
  color: #161643;
  margin-left: 10px;
`;

export const TransferBlock = styled.div`
  margin: 25px 0 0;
  display: block;
`;

export const BalanceIcon = styled.img`
  width: 29px;
  height: 19px;
`;

export const LoaderWrapper = styled.div`
  display: inline-block;
  position: relative;
  top: 5px;
`;

export const StatusWrapper = styled.div`
  margin: 20px 0 30px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 16px;
`;

type StatusDetailsProps = {
  status: PAYMENTS_SETTINGS_STATUSES;
};

export const StatusDetails = styled.span<StatusDetailsProps>`
  color: ${(props) =>
    props.status === PAYMENTS_SETTINGS_STATUSES.invalid ? '#FF2467' : '#9696B9'};
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 10px;
`;

export const ContactSupportButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  cursor: pointer;
  color: #385cf8;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  padding: 0;
  margin: 0;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const TryAgainButtonWrapper = styled.span`
  margin-right: 20px;

  & > button {
    display: inline-flex;
    justify-content: center;
    min-width: 114px;
  }
`;

export const PaymentsStatusDetails = styled.span`
  margin-right: 40px;
`;

export const Wrapper = styled.div`
  margin-bottom: 40px;
`;

export const ChangePaymentSettingsButton = styled(BaseButton)`
  color: #161643;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  position: absolute;
  right: 60px;
  top: 40px;

  &:hover,
  &:active {
    opacity: 1;
  }

  &:hover > img {
    box-shadow: 0 3px 3px #0f477734;
  }

  &:active > img {
    opacity: 0.95;
  }

  > img {
    height: 20px;
    width: 20px;
    border-radius: 3px;
    transition: box-shadow 0.15s ease-in-out;
    margin-right: 8px;
    vertical-align: middle;
  }
`;

export const ConnectionButtonsWrapper = styled.div`
  display: flex;

  & button:first-child {
    margin-right: 20px;
  }
`;

export const ConnectPaymentButton = styled(Button)<ButtonProps & {isActive?: boolean}>`
  min-width: 275px;
  min-height: 67px;
  padding: 23px 20px;
  display: flex;
  flex-direction: row-reverse;
  background: ${(props) => (props.isActive ? '#FFFFFF' : '#F2F2FA')};
  color: ${(props) => (props.isActive ? '#161643' : '#9696B9')};
  border: 1px solid ${(props) => (props.isActive ? '#161643' : '#F2F2FA')};
  box-shadow: none;
  & img {
    width: 65px;
    height: 26px;
    margin-left: auto;
    position: relative;
    top: -1px;
  }
`;

export const CloseModalButton = styled(BaseButton)`
  padding: 10px;
  position: absolute;
  top: 13px;
  right: 13px;

  & > img {
    width: 16px;
    height: 16px;
  }
`;

export const RetryButton = styled(SmallButton)`
  &&& {
    margin-left: 5px;
    width: auto;
    min-width: 60px;
  }
`;

export const SectionWrapper = styled(LargeTooltipSectionWrapper)`
  .section {
    position: relative;
  }

  & ${TooltipContentWrapper} {
    top: 130px;
  }
`;

export const ChangeAccountButton = styled(Button)`
  margin-top: 15px;
`;

export const PaymentsSetupTooltip = styled(Tooltip)`
  display: inline-block;
  margin-left: 5px;
  text-align: left;
`;

export const InputStyled = styled(Input)`
  width: 190px;

  & .input {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid rgb(237, 237, 240);

    ${(props) =>
      (props.invalid || props.error) &&
      css`
        border-color: #ff2467;
      `};
  }
`;

export const Form = styled.form`
  display: flex;
  column-gap: 20px;
`;

export const ButtonStyled = styled(Button)<ButtonProps & {success: boolean}>`
  justify-content: center;
  margin-top: 25px;

  ${(props) =>
    props.success &&
    css`
      background: transparent;
      box-shadow: none;
      color: green;
      opacity: 1;
      cursor: default;

      &:hover {
        opacity: 1;
      }
    `}
`;

export const TooltipStyled = styled(Tooltip)`
  & .content {
    top: 80px;
  }
`;
