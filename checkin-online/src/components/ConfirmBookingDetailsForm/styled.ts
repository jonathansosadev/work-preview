import styled from 'styled-components';
import {device} from '../../styled/device';
import {StyledShortInput} from '../ShortInput/styled';

export const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 40px 0 50px;
  flex-direction: column;
  align-items: center;

  @media (max-width: ${device.tablet}) {
    margin-top: 13px;
    margin-bottom: 100px;
  }
`;

export const CheckDatesContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 20px;
  ${StyledShortInput} {
    width: 155px;

    &:last-child {
      margin-left: 17px;
    }
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SubmitButtonWrapper = styled.div`
  margin: 25px 0;
`;
