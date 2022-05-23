import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

export const ShareLinkInput = styled.input`
  height: 25px;
  width: 246px;
  margin-right: 30px;
  text-align: left;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 21px;
  padding: 5px;
  overflow: hidden;
  border: 0;
  border-bottom: 1px solid #ced7e5;
  outline: none;
  color: #1a8cff;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
