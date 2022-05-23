import styled from 'styled-components';
import {DatesRangeInput} from '../SearchReservationScreen/styled';
import Select from '../Select';
import {device} from '../../styled/device';

export const Item = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 16px;
`;

export const ReservationGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 25px 30px;
  margin-bottom: 25px;
  //row-gap: 25px;

  @media (max-width: ${device.tablet}) {
    grid-template-columns: auto;
  }

  & ${Item}:nth-child(2) {
    @media (max-width: ${device.tablet}) {
      display: none;
    }
  }
`;

export const SelectStyled = styled(Select)`
  margin: 0;
`;

export const DateRangePicker = styled(DatesRangeInput)`
  margin-bottom: 0;
`;

export const Form = styled.form`
  display: grid;
  margin-top: 20px;
`;
