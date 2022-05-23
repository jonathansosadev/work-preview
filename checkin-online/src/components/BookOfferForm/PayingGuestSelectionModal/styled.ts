import styled from 'styled-components';
import Button from '../../Button';

export const Content = styled.div`
  padding: 26px 48px;
  width: 500px;
  cursor: default;
`;

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  color: #161643;
  margin-bottom: 23px;
  text-align: left;
`;

export const Subtitle = styled(Title)`
  font-size: 16px;
  margin-bottom: 5px;
  text-align: left;
`;

export const Guests = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
  max-width: 437px;
  width: 100%;
`;

export const GuestRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 18px 0;
  border-bottom: 1px solid rgb(227 227 232);
  align-items: center;
`;

export const SelectButton = styled(Button)`
  min-width: 76px;
  height: 25px;
  font-size: 14px;
`;

export const BottomButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 50px;

  > a {
    text-decoration: none;
  }
`;
