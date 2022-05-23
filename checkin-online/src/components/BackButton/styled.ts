import styled from 'styled-components';
import Button from '../Button';
import {IconContainer} from '../Button/styled';

export const StyledBackButton = styled(Button)`
  min-width: 82px;
  height: 29px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 12px;
  justify-content: flex-start;
  padding: 0 12px 0 0;
  background: white;
  color: #385cf8;

  & ${IconContainer} {
    width: 30px;

    & > img {
      width: 9px;
      height: 15px;
      margin-top: 3px;
    }
  }
`;
