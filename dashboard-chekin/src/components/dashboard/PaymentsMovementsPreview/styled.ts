import styled from 'styled-components';
import {ReactComponent as DirectDownloadIcon} from '../../../assets/direct-download.svg';
import Button from '../Button';
import Select from '../Select';
import DateRangePicker from '../DateRangePicker';
import Loader from '../../common/Loader';
import {CalendarIcon, Label, Wrapper} from '../DateRangePicker/styled';

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
`;

export const MainHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 13px;
`;

export const FiltersWrapper = styled.div`
  display: flex;
  column-gap: 20px;
`;

export const DateRangePickerStyled = styled(DateRangePicker)`
  & ${Label} {
    margin-bottom: 0;
  }

  & ${Wrapper} {
    border: none;
    background: none;
  }

  & .DateInput_input {
    font-size: 15px;
  }

  & ${CalendarIcon} {
    width: 21px;
    height: 21px;
    top: 12px;
  }
`;

export const StyledSelect = styled(Select)`
  &&& {
    width: 185px;
    min-width: 135px;
    margin-right: 5px;
    border: none;
  }
  &&& .select__placeholder {
    color: #161643;
  }
  &&& .select__control {
    border: none;
    white-space: nowrap;
    background: none;
  }
  & .select__menu,
  & .select__menu-list {
    width: 270px;
  }

  & .select__single-value {
    padding-right: 3px;
  }

  & .select__indicator {
    img {
      right: 0;
    }
  }
`;

export const DownloadBtn = styled(Button)`
  width: 172px;
  height: 40px;
`;

export const DownloadIcon = styled(DirectDownloadIcon)`
  margin-right: 12px;
`;

export const Content = styled.main`
  width: 100%;
`;

export const LoaderStyled = styled(Loader)`
  margin: 80px 0 30px;
  display: flex;
  justify-content: center;
`;

export const LoadMoreButton = styled(Button)`
  margin-top: 35px;
  margin-left: 29px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  justify-content: center;
  min-width: 95px;
  height: 30px;

  & div {
    height: auto;
  }
`;
