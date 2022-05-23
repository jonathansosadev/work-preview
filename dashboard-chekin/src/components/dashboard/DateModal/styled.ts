import styled from 'styled-components';

export const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 35px;
  margin-bottom: 45px;
  text-align: left;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;

  & button:first-child {
    margin-bottom: 25px;
    min-width: 211px;
    height: 48px;
  }
`;
