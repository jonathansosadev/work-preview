import styled from 'styled-components';
import Select from '../Select';
import {StyledUpsellingSection} from '../UpsellingSections/styled';

export const RowSelects = styled.div`
  display: flex;
`;

export const StyledReportsSection = styled(StyledUpsellingSection)`
  padding: 25px 58px 46px 58px;
`;

export const StyledSelect = styled(Select)`
  width: 60px;
  min-width: 135px;
  margin-right: 5px;
  border: none !important;
  & select::placeholder {
    color: black;
  }
  & .select__control {
    border: none !important;
  }
  & .select__menu {
    width: 170px;
  }
  & .select__menu-list {
    width: 170px;
  }
`;

export const StyledSelectYears = styled(StyledSelect)`
  min-width: 100px;
`;

export const BlockCards = styled.div`
  display: flex;
  margin-top: 13px;
  column-gap: 74px;
  row-gap: 50px;
  flex-wrap: wrap;
`;
