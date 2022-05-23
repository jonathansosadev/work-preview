import styled from 'styled-components';
import {Menu} from '../CreateOfferButton/styled';

export const Container = styled.div`
  box-sizing: border-box;
  overflow-y: visible;
  margin-left: -7px;
`;

export const Grid = styled.div`
  display: grid;
  grid-auto-rows: 85px;
  grid-template-columns: repeat(auto-fill, 386px);
  grid-column-gap: 45px;
  grid-row-gap: 12px;
  padding: 7px 0 0 7px;

  > div {
    height: 77px;
  }
`;

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  margin-bottom: 25px;
  font-size: 16px;
`;

export const PlaceholderContainer = styled.div`
  background: #f2f2fa;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 77px;

  ${Menu} {
    top: -19px;
  }
`;
