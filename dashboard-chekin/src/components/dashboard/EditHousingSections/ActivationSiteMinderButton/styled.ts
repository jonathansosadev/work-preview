import styled from 'styled-components';
import Button from '../../Button';

export const ButtonStyled = styled(Button)``;

export const ButtonLabel = styled.div`
  display: flex;
  column-gap: 7px;

  & > img {
    position: relative;
    top: -1px;
  }
`;
