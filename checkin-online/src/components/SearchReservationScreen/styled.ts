import styled, {css} from 'styled-components';
import {device} from '../../styled/device';
import DateRangePicker from '../DateRangePicker';
import Button from '../Button';
import Datepicker from '../Datepicker';

export const Container = styled.div`
  display: flex;
  justify-content: center;
`;

export const Wrapper = styled.div`
  display: grid;
  margin: 40px 0 40px;
  padding: 0 20px;

  @media (max-width: ${device.laptop}) {
    margin-top: 0;
  }
`;

export const Logo = styled.img`
  justify-self: center;
  width: 220px;
  margin-bottom: 70px;
`;

export const LogoIcon = styled.img`
  margin-top: 5px;
`;

export const Title = styled.h2`
  text-align: center;
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  margin: 0 auto 10px;

  @media (max-width: ${device.mobileL}) {
    font-size: 25px;
  }
`;

export const Subtitle = styled.h3`
  text-align: center;
  font-family: ProximaNova-Light, sans-serif;
  font-weight: 500;
  color: #161643;
  font-size: 18px;
  margin: 0 auto 40px;

  @media (max-width: ${device.mobileL}) {
    font-size: 21px;
  }
`;

export const MobileAction = styled.div`
  display: none;

  @media (max-width: ${device.laptop}) {
    display: flex;
    flex-direction: column;
    text-align: center;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 23px;
    margin-top: 50px;
  }
`;

export const ButtonStyled = styled(Button)`
  height: auto;
  margin: 5px auto;
  text-align: center;
  font-size: 23px;
`;

export const SearchForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  row-gap: 25px;
`;

export const Item = styled.div<{isVisible?: boolean; isMobileMode?: boolean}>`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${props =>
    props.isMobileMode &&
    !props.isVisible &&
    css`
      display: none;
    `}
`;

export const Content = styled.div`
  display: flex;
  gap: 50px;

  & ${Item}:nth-child(2) {
    display: flex;
    align-items: center;
    flex-direction: column;
    row-gap: 20px;
    font-family: ProximaNova-Regular, sans-serif;
    color: #161643;

    @media (max-width: ${device.laptop}) {
      display: none;
    }
  }

  @media (max-width: ${device.laptop}) {
    flex-direction: column;
  }
`;

export const VerticalLine = styled.div`
  height: 100%;
  width: 1px;
  background: #e2e7ef;
`;

export const DatesRangeInput = styled(DateRangePicker)`
  width: 314px;
  margin-bottom: 25px;

  .wrapper {
    width: 100%;
  }
`;

export const DatepickerInput = styled(Datepicker)`
  //margin-bottom: 25px;
`;

export const ConfirmButton = styled(Button)`
  margin: 25px auto 0;
`;

export const GoBackButton = styled(Button)`
  margin: 10px auto 0;
  min-width: auto;
`;
