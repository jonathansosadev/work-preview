import styled from 'styled-components';

export const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  color: #161643;
  background: #f2f2fa;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  padding: 5px 14px;
`;

export const GridRow = styled.div`
  box-sizing: border-box;
  border-bottom: 1px solid #f2f2fa;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  text-align: left;
  display: grid;
  padding: 19px 29px 12px;
  align-items: center;
  grid-template-columns: 1fr 1fr;

  & > div {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  & > :first-child {
    font-size: 14px;
  }

  & > :last-child {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 31px;
    text-align: right;
  }
`;

export const SpannedRow = styled.div`
  grid-column: 1 / 3;
`;

export const PaymentTypeStyled = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #385cf8;
`;

export const Wrapper = styled.div`
  width: 100%;
`;

export const Total = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
`;

export const GuestName = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #acacd5;
`;

export const InfoColumn = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;

  & :last-child {
    margin-bottom: 0;
  }

  & ${GuestName} {
    margin-top: 2px;
  }
`;

export const HousingName = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  margin-bottom: 4px;
`;
