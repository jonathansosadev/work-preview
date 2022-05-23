import styled from 'styled-components';

export const Subtitle = styled.div`
  display: flex;
  column-gap: 10px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #6b6b95;
`;

export const DescriptionText = styled(Subtitle)`
  margin: 25px 0;
`;

export const SwitchLabel = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 15px;
  display: flex;

  & > div {
    margin-left: 10px;
    position: relative;
    top: -1px;
  }
`;
