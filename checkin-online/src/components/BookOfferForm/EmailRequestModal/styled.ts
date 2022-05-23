import styled from 'styled-components';
import Input from '../../Input';

export const Form = styled.form`
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

export const InputWrapper = styled.div`
  margin: -30px auto 0;
`;

export const ModalInput = styled(Input)`
  width: 250px;
`;

export const ButtonsWrapper = styled.div`
  margin: 30px auto 20px;

  > button:first-child {
    margin-bottom: 10px;
  }
`;
