import styled, {css} from 'styled-components';
import Button from '../Button';
import Select from '../Select';
import Input, {SpinnerButtons} from '../Input';
import SingleDatePicker from '../SingleDatePicker';
import {device} from '../../styled/device';
import {offerMobileLayoutBreakpoint} from '../OfferDetailsScreen/styled';

export const borderWithPadding = css`
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(151, 151, 186, 0.16);
`;

export const Form = styled.form`
  width: 100%;
  cursor: default;
`;

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-bottom: 11px;

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    font-size: 20px;
  }
`;

export const Price = styled(Title)`
  font-size: 23px;
  margin-top: -11px;

  @media (max-width: ${device.mobileL}) {
    font-size: 33px;
  }
`;

export const RequestButton = styled(Button)`
  margin: 35px 0;

  @media (max-width: ${device.mobileL}) {
    margin-right: auto;
    margin-left: auto;
    margin-top: 40px;
  }
`;

export const RequestSecondaryButton = styled(RequestButton)`
  margin: -20px 0 35px 0;

  @media (max-width: ${device.mobileL}) {
    margin-right: auto;
    margin-left: auto;
    margin-top: -20px;
  }
`;

export const Text = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;

  @media (max-width: ${device.mobileL}) {
    font-size: 20px;
  }
`;

export const Address = styled.div`
  position: relative;
  margin-bottom: 12px;
`;

export const ViewMapLink = styled.a`
  text-decoration: none;
  position: absolute;
  right: 0;
  top: 0;
  color: #002aed;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;

  @media (max-width: ${device.mobileL}) {
    font-size: 18px;
  }
`;

export const NumberOfPeopleInput = styled(Input)`
  width: 102px;
  margin-right: 13px;

  .error-message {
    text-align: left;
  }
`;

export const StyledSpinnerButtons = styled(SpinnerButtons)`
  position: relative;
  top: 40px;
`;

export const ContentWrapper = styled.div`
  display: flex;
  ${borderWithPadding};
`;

export const StyledSingleDatePicker = styled(SingleDatePicker)`
  width: 153px;

  @media (max-width: ${device.tablet}) {
    width: 197px;
  }
`;

export const TimeSelect = styled(Select)`
  width: 97px;
  margin-left: 13px;

  .select__menu,
  .select__menu-list {
    width: 97px;
  }

  .select__menu-list {
    padding: 15px;
  }

  .select__option {
    padding: 10px 10px 10px 0;
  }

  .select__value-container {
    padding-left: 10px;
  }

  @media (max-width: ${device.tablet}) {
    min-width: 110px;

    &,
    .select__menu,
    .select__menu-list {
      width: 110px;
    }
  }
`;
