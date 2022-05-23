import styled from 'styled-components';
import {CustomCheckbox} from '../components/dashboard/Checkbox';
import FormHeader from '../components/dashboard/FormHeader';
import {Box, AcceptIconImg} from '../components/dashboard/Checkbox/styled';

export const ReportHeading = styled(FormHeader)`
  grid-template-columns: 1fr 2fr 1fr;
`;

export const Section = styled.div`
  padding-bottom: 28px;
  margin-bottom: 28px;
  border-bottom: 1px solid rgb(220 229 242);
`;

export const SectionTitle = styled.div`
  color: #161643;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  margin-bottom: 18px;
`;

export const Main = styled.main`
  margin-top: 28px;
`;

export const CheckboxesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 280px);
  grid-template-rows: repeat(10, auto);
`;

export const Checkbox = styled(CustomCheckbox)`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 17px;
  color: #161643;
  display: inline-flex;
  margin-bottom: 18px;

  & ${Box} {
    height: 16px;
    width: 16px;
    margin-right: 12px;
  }

  & ${AcceptIconImg} {
    height: 9px;
    position: relative;
  }
`;

export const DirectDownloadIcon = styled.img`
  height: 14px;
  width: 18px;
`;

export const Text = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 28px;
`;

export const LoaderWrapper = styled.div`
  margin-top: 13%;
  text-align: center;
`;
