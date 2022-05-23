import styled from 'styled-components';
import {default as BaseAsyncSelect} from '../AsyncSearchSelect';

export const StyledAsyncSelect = styled(BaseAsyncSelect)`
  margin: 22px auto 0;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 30px;
  margin-top: 95px;

  & button:first-child {
    margin-bottom: 15px;
  }
`;
