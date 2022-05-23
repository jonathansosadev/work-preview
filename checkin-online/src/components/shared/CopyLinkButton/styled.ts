import styled from 'styled-components';
import {OriginalButton} from '../../Button';

export const CopyLinkButtonStyled = styled(OriginalButton)`
  font-size: 16px;
  & img {
    width: 21px;
    height: 21px;
    position: relative;
    top: -3px;
    margin-right: 5px;
  }
`;
