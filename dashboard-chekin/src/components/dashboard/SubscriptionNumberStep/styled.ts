import styled from 'styled-components';
import Input from '../Input';
import BaseTooltip from '../Tooltip';
import Button from '../Button';
import {ErrorMessage} from '../../../styled/common';
// import {SpinnerButtonsWrapper} from '../Input/styled';

export const Content = styled.div`
  max-width: 1047px;
  margin: 21px auto 0;
  cursor: default;
  padding: 0 120px 230px;
  text-align: center;
`;

export const Header = styled.div`
  font-size: 21px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
`;

export const SubHeader = styled.div`
  font-size: 18px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  margin-top: 49px;
  margin-bottom: 39px;
`;

export const Tip = styled.div`
  font-size: 13px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  margin-top: 24px;
  margin-bottom: 84px;
`;

export const CancelButtonWrapper = styled.div`
  margin-top: 34px;
  display: flex;
  justify-content: center;
`;

export const NumberOFRoomsInput = styled(Input)`
  margin: 0 auto;
  height: 67px;

  & input {
    font-family: ProximaNova-Semibold, sans-serif;
    font-size: 31px;
    text-align: center;

    &::placeholder {
      text-align: center;
    }
  }

  & ${ErrorMessage} {
    font-size: 13px;
  }
`;

export const NextButton = styled(Button)`
  margin: 0 auto 34px;
  border: 1px solid #385cf8;
  min-width: 148px;

  div {
    margin: 0 auto;
  }
`;

export const Tooltip = styled(BaseTooltip)`
  display: inline-block;
  margin-left: 10px;
  position: relative;
  top: -1px;

  & b {
    font-family: ProximaNova-Semibold, sans-serif;
    font-weight: normal;
  }
`;
