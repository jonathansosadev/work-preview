import styled from 'styled-components';

export const Icon = styled.img`
  width: 25px;
  height: 17px;
`;

export const DotsGroup = styled.div`
  font-size: 8px;
  letter-spacing: 2px;
  margin-left: 12px;
`;

export const LastFour = styled.div`
  margin-left: 12px;
  margin-right: 45px;
`;

export const ExpirationDate = styled.div`
  margin-right: 51px;
`;

export const Container = styled.div`
  min-width: 374px;
  height: 31px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  color: #161643;
  display: inline-flex;
  align-items: center;
  border-bottom: 2px solid #e2e7ef;
  padding: 0 5px 6px;
  cursor: default;

  & ${DotsGroup}:last-child {
    margin-right: 7px;
  }
`;
