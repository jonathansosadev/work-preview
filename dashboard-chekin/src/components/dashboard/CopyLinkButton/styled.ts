import styled from 'styled-components';
import BaseButton from '../Button';

export const CopyButton = styled(BaseButton)`
  cursor: copy;

  &:active {
    border-color: #385cf8;
  }
`;
