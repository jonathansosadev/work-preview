import styled from 'styled-components';
import {StyledButton} from '../Button/styled';

export const Wrapper = styled.div`
  padding: 79px 0 0 0;
  text-align: center;

  display: flex;
  justify-content: center;
`;

export const Form = styled.form``;

export const FieldWrapper = styled.div`
  padding: 30px 0 0 0;
`;

export const ButtonWrapper = styled.div`
  padding: 57px 0 0 0;

  display: flex;
  flex-direction: row;
  justify-content: center;

  & > ${StyledButton} {
    justify-content: center;
  }
`;
