import styled from 'styled-components';
import Button from '../Button';

export const OnlineCheckinSectionWrapper = styled.section`
  margin-top: 13px;
`;

export const HeaderWrapper = styled.div`
  display: grid;
  grid-template-columns: 130px 82px;
  column-gap: 20px;
  align-items: center;
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  font-size: 18px;
`;

export const InfoLink = styled.a`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #385cf8;
  text-decoration: none;
`;

export const DescriptionText = styled.div``;

export const SaveButton = styled(Button)`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;
