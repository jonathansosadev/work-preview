import styled from 'styled-components';

export const FieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  text-align: left;

  & > :first-child {
    margin-bottom: 25px;
  }
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
  margin-top: 56px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;
