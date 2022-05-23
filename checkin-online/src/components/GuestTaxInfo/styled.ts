import styled from 'styled-components';
import {device} from '../../styled/device';
import Input from '../Input';
import {Label as InputLabel, StyledInput as InputBox} from '../Input/styled';
import {ErrorMessage} from '../../styled/common';
import {Label} from '../Select/styled';

export const ShortInput = styled(Input)`
  min-width: auto;
  width: 125px;

  & ${InputLabel} {
    font-size: 14px;
  }

  & ${InputBox} {
    padding-top: 12px;
  }

  & ${InputBox}, & ${InputBox}::placeholder {
    font-size: 16px;
  }

  & ${ErrorMessage} {
    height: 0;
    font-size: 11px;
    white-space: nowrap;
  }
`;

export const SelectWrapper = styled.div`
  & ${Label} {
    font-size: 14px;
  }

  .select__single-value,
  .select__placeholder,
  .select__input,
  .select__input input {
    font-size: 16px !important;
  }

  .select__menu-list,
  .select__menu,
  > div {
    width: 240px !important;

    @media (max-width: ${device.mobileL}) {
      width: 180px !important;
    }

    @media (max-width: ${device.mobileM}) {
      width: 130px !important;
    }
  }

  & ${InputLabel} {
    font-size: 14px;
  }

  & ${InputBox}, & ${InputBox}::placeholder {
    font-size: 16px;
    padding-top: 12px;
  }

  & ${ErrorMessage} {
    height: 0;
    font-size: 11px;
  }
`;

export const GuestBox = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-column-gap: 45px;
  background-color: #fdfdfd;
  border: 1px solid #9696b9;
  margin-bottom: 8px;
  padding: 17px 16px;
  border-radius: 3px;
  min-height: 75px;
  box-sizing: border-box;
  align-items: center;
  cursor: default;
  position: relative;

  @media (max-width: ${device.tablet}) {
    height: 132px;
    align-items: flex-end;
    padding-top: 40px;
    padding-bottom: 18px;
    grid-column-gap: 15px;
    margin-bottom: 12px;
    min-width: 240px;

    & ${SelectWrapper} > div {
      min-width: auto;
    }
  }

  @media (max-width: ${device.mobileL}) {
    grid-auto-flow: row;
    height: auto;
    width: 80%;
    grid-gap: 15px;

    & ${SelectWrapper} > div {
      width: 100% !important;

      .select__menu-list,
      .select__menu {
        width: 100% !important;
      }
    }

    & ${ShortInput} {
      width: 60%;
    }
  }
`;

const BoldText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 18px;
`;

export const GuestNumber = styled.span`
  width: 20px;
  display: inline-block;
`;

export const GuestName = styled(BoldText)`
  @media (max-width: ${device.tablet}) {
    position: absolute;
    top: 15px;
    left: 16px;
  }
`;

export const GuestTax = styled(BoldText)`
  width: 60px;
  text-align: right;
  word-break: break-all;

  @media (max-width: ${device.tablet}) {
    position: absolute;
    top: 13px;
    right: 16px;
  }
`;
