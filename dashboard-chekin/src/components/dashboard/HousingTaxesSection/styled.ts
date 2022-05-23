import styled, {css} from 'styled-components';
import DateRangePicker from '../DateRangePicker';
import Input from '../Input';
import ExemptSourcesSubsection from '../ExemptSourcesSubsection';
import FeesOptions from '../FeesOptions';
import {CheckboxWrapper as BaseCheckboxWrapper} from '../Checkbox/styled';
import {Wrapper} from '../DateRangePicker/styled';
import {ErrorMessage} from '../../../styled/common';
import {Name as InputName} from '../Input/styled';

export const LoaderWrapper = styled.div`
  text-align: center;
  margin-top: 10%;
`;

export const SeasonContainer = styled.div`
  min-width: 300px;
  box-shadow: 0 7px 7px #2148ff1a;
  border: 1px solid #161643;
  border-radius: 3px;
  padding: 34px 22px 25px 22px;
  display: flex;
  flex-direction: column;
  margin-top: 25px;
  box-sizing: border-box;
`;

export const SeasonsGroup = styled.div`
  display: flex;

  & ${SeasonContainer}:not(:first-child) {
    margin-left: 38px;
  }
`;

export const SeasonLabel = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-bottom: 22px;
`;

export const SeasonDatePickerWrapper = styled.div`
  margin-bottom: 25px;
  text-align: left;
`;

export const ShortInput = styled(Input)`
  width: 160px;
`;

export const ShortInputWrapper = styled.div`
  display: flex;
`;

type ShortInputCurrencyProps = {
  disabled?: boolean;
};

export const ShortInputCurrency = styled.div<ShortInputCurrencyProps>`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 24px;
  margin-left: 5px;
  opacity: ${(props) => props.disabled && '0.3'};
  position: relative;
  top: 40px;
`;

export const ExceptionsLabel = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-bottom: 15px;
  margin-top: 35px;
`;

export const ExceptionsRules = styled.div`
  display: flex;
  flex-direction: column;
`;

export const LessThanRuleWrapper = styled.div`
  display: flex;
  margin-bottom: 32px;
`;

export const ExceptionRuleWrapper = styled.div`
  margin-right: 58px;
`;

export const ExceptionsMultiSelectWrapper = styled.div`
  margin-bottom: 36px;
`;

export const MaxNightsTaxedInputWrapper = styled.div`
  margin-top: 31px;
`;

export const ExportSettingsButtonWrapper = styled.div`
  margin-top: 33px;
`;

export const MonthElement = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 18px;
  font-weight: normal;
`;

export const DayMonthPicker = styled(DateRangePicker)`
  & ${Wrapper} {
    width: 160px;
  }

  & .DateInput {
    width: 60px;
  }

  & .DateRangePickerInput_arrow {
    padding-left: 8px;
    padding-right: 10px;

    > div {
      padding: 0;
    }
  }

  & .DateRangePicker .DateInput_input {
    padding-right: 29px;
  }
`;

export const LowSeasonDayMonthPicker = styled(DayMonthPicker)`
  & ${Wrapper} {
    opacity: ${(props) => props.disabled && '1'};
    cursor: ${(props) => props.disabled && 'default'};
  }
`;

export const SinglePricePerNightWrapper = styled(ShortInputWrapper)`
  margin-top: 30px;
  margin-bottom: 32px;
`;

type AgeRuleRowProps = {
  active?: boolean;
};

export const AgeRuleRow = styled.div<AgeRuleRowProps>`
  height: 90px;
  display: grid;
  grid-template-columns: 0.5fr 1fr 1.1fr 1fr 1fr;
  align-items: center;
  transition: background-color 0.2s ease-in-out;
  background-color: ${(props) => (props.active ? 'transparent' : 'rgb(248 252 255)')};
`;

export const WhiteSpace = styled.div`
  height: 100%;
  border-bottom: 1px solid red;
`;

export const ModalAgeRuleRow = styled(AgeRuleRow)`
  grid-template-columns: 38px 0.5fr 1fr 1.1fr 1fr 1fr 38px;
  padding: 10px 0;

  & ${WhiteSpace} {
    border-color: ${(props) => (props.active ? 'white' : 'rgb(248 252 255)')};
  }
`;

export const AgeRulesContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  margin-bottom: 23px;
  width: 680px;

  & ${AgeRuleRow}:not(:last-child) {
    border-bottom: 1px solid rgb(235 241 249);
  }
`;

export const ModalAgeRulesContainer = styled(AgeRulesContainer)`
  width: 773px;
`;

type CheckboxWrapperProps = {
  checked?: boolean;
};

export const CheckboxWrapper = styled.div<CheckboxWrapperProps>`
  padding-left: 26px;
  width: 100%;

  & ${BaseCheckboxWrapper} {
    min-width: unset;
    padding: 25px 0;
  }
`;

type AgeRuleNameButtonProps = {
  grayed?: boolean;
};

export const AgeRuleNameButton = styled.button<AgeRuleNameButtonProps>`
  outline: none;
  border: none;
  user-select: none;
  background-color: transparent;
  font-family: ProximaNova-Medium, sans-serif;
  text-align: left;
  font-size: 16px;
  padding: 25px 20px;
  margin: 0;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  color: ${(props) => (props.grayed ? '#9696b9' : '#161643')};
`;

export const AgeRuleInput = styled(Input)`
  width: 40px;

  & ${InputName} {
    font-size: 14px;
  }

  & input {
    background-color: transparent;
    margin-bottom: 3px;
    padding: 9px 8px;
  }

  & ${ErrorMessage} {
    white-space: nowrap;
    text-align: left;
    height: 0;
    margin: 0;
  }

  ${(props) =>
    props.disabled &&
    css`
      &,
      & ${InputName}, & input {
        color: #9696b9;
        opacity: 1;
      }

      & input {
        border-color: #e2e7ef;
      }

      & ${ErrorMessage} {
        visibility: hidden;
      }
    `}
`;

type AgeRuleSeasonInputSideLabelProps = {
  disabled?: boolean;
};

export const AgeRuleSeasonInputSideLabel = styled.div<AgeRuleSeasonInputSideLabelProps>`
  font-family: ProximaNova-Medium, sans-serif;
  margin-left: 2px;
  position: absolute;
  left: 66px;
  bottom: 0;
  font-size: 14px;
  color: ${(props) => (props.disabled ? '#9696b9' : '#161643')};
`;

export const AgeRuleSeasonInput = styled(AgeRuleInput)`
  width: 113px;

  & input {
    width: 62px;
  }
`;

export const BetweenAgesWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
`;

type BetweenAgesTextProps = {
  disabled?: boolean;
};

export const BetweenAgesText = styled.span<BetweenAgesTextProps>`
  color: ${(props) => (props.disabled ? '#9696b9' : '#161643')};
  font-family: ProximaNova-Medium, sans-serif;
  padding: 0 20px;
  font-size: 13px;
`;

export const AgeRulesLabel = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-bottom: 22px;
  margin-top: 35px;
`;

export const RestartTaxesModalButtonWrapper = styled.div`
  margin-top: 15px;
`;

export const StyledExemptSourcesSubsection = styled(ExemptSourcesSubsection)`
  margin-top: 35px;
`;

export const TaxesFeesOptions = styled(FeesOptions)`
  margin-top: 25px;
`;
