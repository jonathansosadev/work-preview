import styled from 'styled-components';
import {DisplayIcon} from '../Select';
import {KeyboardHint} from '../AsyncSearchSelect/styled';

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
  margin-top: 95px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;

  > div:first-child {
    margin: 22px auto 0;
  }

  & ${DisplayIcon} {
    display: none;
  }
`;

export const StyledKeyboardHint = styled(KeyboardHint)`
  right: 35px;
  top: 0;
  bottom: 0;
  display: inline-flex;
  align-items: center;
`;
