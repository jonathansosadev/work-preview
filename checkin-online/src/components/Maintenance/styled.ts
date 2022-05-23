import styled from 'styled-components';
import investigatingIllustration from '../../assets/investigating-error-illustration.svg';

export const Container = styled.div`
  color: rgb(22, 22, 67);
  text-align: center;
  max-width: 765px;
  margin: 0 auto 20px;
`;

export const Title = styled.header`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 38px;
  margin-bottom: 30px;
`;

export const Description = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 18px;

  b {
    font-weight: normal;
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const Illustration = styled.div`
  height: 268px;
  margin: 67px auto 20px;
  background: url(${investigatingIllustration}) no-repeat center center / cover #161643;
`;
