import styled from 'styled-components';

export const ButtonsWrapper = styled.div`
  margin: 70px auto;
  padding-bottom: 70px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > :first-child {
    margin-bottom: 20px;
  }
`;

export const GuestsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
  margin-top: 40px;
`;

export const TopText = styled.div`
  margin-top: 45px;
  color: #161643;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  text-align: center;
  padding: 0 30px;
`;

export const TotalTaxes = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 18px;
  text-align: center;
  cursor: default;
  display: flex;
  flex: 1;
  order: 1;
  max-width: 310px;
  padding: 0 50px;
  margin: 10px auto 0;

  &:before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    top: 7px;
    left: 0;
    position: absolute;
    color: #161643;
  }

  &:after {
    content: '';
    margin: -1px 1px 0;
    background: radial-gradient(circle at 50% 50%, #161643 12%, transparent 15%) repeat-x
      0 0.5em;
    background-size: 4px 15px;
    flex-grow: 1;
    order: 2;
  }

  & > span:first-child {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const TotalTaxesPrice = styled.span`
  font-size: 20px;
  order: 3;
`;
