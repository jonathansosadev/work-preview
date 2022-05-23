import styled from 'styled-components';

export const TableDivRow = styled.div`
  height: 48px;
  border-bottom: 1px solid #f0f0f3;
`;

export const TableModal = styled.div`
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 306px;
  box-shadow: 0 30px 30px #2148ff1a;
  border-radius: 6px;
  background-color: white;
  z-index: 1;
  text-align: center;
  padding: 20px 30px 38px;
  box-sizing: border-box;
  cursor: default;
`;

export const TableModalIcon = styled.img`
  margin: 20px 0;
  max-width: 58px;
`;

export const TableModalText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 16px;
  color: #161643;
  margin-bottom: 18px;
`;

export const TableModalTitle = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  margin-bottom: 20px;
  color: #161643;
`;
