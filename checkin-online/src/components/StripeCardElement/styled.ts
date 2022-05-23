import styled from 'styled-components';
import {ErrorMessage} from '../../styled/common';
import {device} from '../../styled/device';

export const Wrapper = styled.div`
  width: 374px;

  @media (max-width: ${device.mobileM}) {
    width: 300px;
  }
`;

export const CardElementWrapper = styled.div`
  border-bottom: 1px solid rgb(222 228 237);
  padding: 0 10px 5px 0;
  box-sizing: border-box;
`;

export const Error = styled(ErrorMessage)`
  min-height: 17px;
`;
