import styled from 'styled-components';
import {CustomCheckbox} from '../Checkbox';

export const Container = styled.div``;

export const Checkbox = styled(CustomCheckbox)`
  display: flex;
  align-items: center;

  span {
    max-width: 270px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const SelectAllWrapper = styled.div`
  margin-bottom: 20px;
  padding-top: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(0 66 154 / 0.2);

  .label {
    margin-top: 0;
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const CheckboxesWrapper = styled.div`
  display: grid;
  grid-auto-rows: 24px;
  row-gap: 20px;
  min-height: 220px;
  max-height: 220px;
  overflow-y: auto;
`;

export const LoaderWrapper = styled.div`
  margin-top: 80px;
`;
