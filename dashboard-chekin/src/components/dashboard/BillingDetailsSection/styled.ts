import styled from 'styled-components';

export const FormWrapper = styled.div`
  display: flex;
  grid-gap: 10px;
`;

export const FormPartWrapper = styled.div`
  width: 33.3%;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 25px;
  &:last-child {
    margin-bottom: 0;
  }
`;

export const CityFormItemWrapper = styled.div`
  margin-top: 44px;
`;

export const FormTextInfo = styled.div`
  font-size: 16px;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
`;

export const SubmitButtonWrapper = styled.div`
  margin-top: 25px;
`;

export const Form = styled.form``;

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #ffffff;
`;

export const LoaderWrapper = styled.div`
  margin-top: 30px;
`;
