import styled from 'styled-components';
import investigatingIllustration from '../../../assets/investigating-error-illustration.svg';

export const Content = styled.main`
  text-align: center;
  margin-bottom: 30px;
`;

export const Illustration = styled.div`
  max-width: 765px;
  height: 268px;
  margin: 67px auto 43px;
  background: url(${investigatingIllustration}) no-repeat center center / cover #161643;
`;

export const Title = styled.header`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 20px;
  text-align: center;
  padding: 0 20px;
  margin-bottom: 22px;
`;

export const Text = styled.div`
  max-width: 330px;
  margin: 0 auto 36px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 16px;
  color: #161643;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & button {
    padding: 10px 20px;
    margin-bottom: 10px;
  }
`;
