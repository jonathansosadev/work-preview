import styled, {css} from 'styled-components';
import {Name} from '../Input/styled';
import Input from '../Input';
import {DisplayIcon as BaseDisplayIcon} from '../Select';
import {Label as ButtonLabel} from '../Button/styled';
import {DEVICE} from '../../../styled/device';
import {ErrorMessage} from '../../../styled/common';

export const StyledInput = styled(Input)`
  width: auto;
  min-height: auto;

  ${(props) =>
    props.error &&
    css`
      & .input {
        color: #ff2467;
        border-color: #ff2467;
      }
    `}

  & ${ErrorMessage} {
    display: none;
  }
`;

export const FieldLabel = styled(Name)<{disabled?: boolean}>`
  min-height: unset;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};
`;

export const Wrapper = styled.div`
  position: relative;
  width: 293px;
  text-align: center;
`;

type SelectedCountryCodeContainerProps = {
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  empty?: boolean;
};
export const SelectedCountryCodeContainer = styled.button<
  SelectedCountryCodeContainerProps
>`
  height: 44px;
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  z-index: 1;
  text-align: left;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  user-select: none;
  outline: none;
  border: 1px solid #161643;
  border-radius: 7px;
  position: relative;
  padding: 0 14px;

  ${(props) =>
    props.readOnly &&
    css`
      opacity: 1;
      cursor: default;
    `};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};

  ${(props) =>
    props.error &&
    css`
      color: #ff2467;
      border-color: #ff2467;
    `}

  ${(props) =>
    props.empty &&
    css`
      background: #f4f6f8;
      color: #8181a3;
      border: none;
    `}
`;

export const CountryCodesContainer = styled.div`
  overflow-y: auto;
  height: 191px;
  text-align: left;
`;

export const DisplayIcon = styled(BaseDisplayIcon)`
  position: absolute;
`;

type MenuProps = {
  open?: boolean;
};

export const Menu = styled.div<MenuProps>`
  width: 100%;
  height: 265px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  position: absolute;
  left: 0;
  z-index: 3;
  background-color: white;
  top: 70px;
  padding: 25px 0 0 37px;
  box-sizing: border-box;
  text-align: left;
  visibility: hidden;

  ${(props) =>
    props.open &&
    css`
      visibility: visible;
    `};

  @media (max-width: ${DEVICE.mobileL}) {
    width: 280px;
  }
`;

export const SearchIcon = styled.img`
  height: 16px;
  width: 16px;
  position: absolute;
  top: 6px;
  left: 8px;
`;

export const SearchInput = styled.input`
  outline: none;
  border: none;
  width: 140px;
  height: 30px;
  position: absolute;
  top: 0;
  left: 32px;

  &,
  &::placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    text-align: left;
    color: #2194f7;
  }
`;

export const InputRelativeWrapper = styled.div`
  width: 140px;
  height: 30px;
  position: relative;
  padding-bottom: 18px;
  margin: 0 !important;
`;

export const Divider = styled.div`
  background-color: rgba(231, 235, 241, 0.51);
  height: 1px;
  margin-right: 37px;
`;

export const Option = styled.div<{
  selected?: boolean;
}>`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  text-align: left;
  line-height: 1.18;
  color: #161643;
  cursor: pointer;
  padding: 19px 9px 18px !important;

  &:hover {
    color: #0081ec;
  }

  ${(props) =>
    props.selected &&
    css`
      font-family: ProximaNova-Medium, sans-serif;
      cursor: default;

      &:hover {
        color: #2d508e;
      }
    `};
`;

export const OptionWrapper = styled.div`
  margin-right: 37px;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(231, 235, 241, 0.51);
  }
`;

export const LoaderWrapper = styled.div`
  width: 16px;
  position: absolute;
  top: 8px;
  right: 2px;
  z-index: 3;
`;

export const RequestErrorMessage = styled.div`
  position: absolute;
  top: 23px;
  right: 0;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 13px;
  z-index: 3;
  color: #ff2467;

  & > button {
    height: 20px;
    min-width: auto;
    font-size: 10px;
    background-color: #ff2467;
    border-color: #ff2467;

    & > ${ButtonLabel} {
      height: auto;
    }
  }
`;

export const EmptyOption = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  text-align: left;
  font-weight: 500;
  line-height: 1.18;
  padding: 19px 9px 18px;
  color: #2d508e;
  opacity: 0.5;
  font-size: 18px;
`;

export const FieldsWrapper = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-column-gap: 10px;
`;
