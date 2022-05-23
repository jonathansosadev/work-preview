import styled from 'styled-components';
import {ErrorMessage, ModalTwoButtonsWrapper} from '../../../styled/common';

export const Main = styled.div`
  margin-top: 28px;
`;

export const FieldsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 293px);
  grid-column-gap: 100px;
  grid-row-gap: 26px;
  margin-top: 36px;
`;

export const FieldsGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 20px;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 30px;

  input {
    margin-bottom: 3px;
  }

  ${ErrorMessage} {
    height: 0;
    margin-top: 0;
  }
`;

export const ModalTwoButtonsWrapperStyled = styled(ModalTwoButtonsWrapper)`
  margin-top: 25px;
`;

export const AnotherLanguageButtonWrapper = styled.div`
  margin-bottom: 32px;
`;
