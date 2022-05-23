import styled from 'styled-components';
import ExemptSourcesSubsection from '../ExemptSourcesSubsection';
import {InputController} from '../Input';
import {Label as InputLabel} from '../Input/styled';

export const Content = styled.main`
  margin-top: 40px;
`;

export const AmountInput = styled(InputController)`
  width: 175px;

  & input {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 25px;
  }

  & input::placeholder {
    font-size: 16px;
  }

  & ${InputLabel} {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    color: #161643;
  }
`;

export const InputWrapper = styled.div`
  position: relative;
  display: flex;
`;

export const RadioButtonsDescription = styled.div`
  margin-bottom: 30px;
  font-size: 16px;
  color: #161643;
  font-family: ProximaNova-Regular, sans-serif;
`;

export const Currency = styled.span`
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 24px;
  margin-left: 5px;
  position: relative;
  top: 40px;
`;

export const StyledExemptSourcesSubsection = styled(ExemptSourcesSubsection)`
  margin-top: 35px;
`;
