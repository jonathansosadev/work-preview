import styled from 'styled-components';
import {TableFilter} from './TableFilter';

export const Filter = styled.div`
  width: 82px;
  height: 30px;
  line-height: 30px;
  box-sizing: border-box;
  padding: 0 20px 0 9px;
  border-radius: 3px;
  background-color: white;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
`;

export const RemoveIcon = styled.img`
  height: 15px;
  width: 15px;
  position: absolute;
  right: 4px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  border-radius: 3px;
  cursor: pointer;

  &:active {
    opacity: 0.95;
  }

  &:hover {
    box-shadow: 0 3px 3px #0f477734;
    transition: box-shadow 0.15s ease-in-out;
  }
`;

export const DateTableFilter = styled(TableFilter)`
  width: auto;
  min-width: 82px;
  padding-right: 24px;
  font-size: 13px;
`;
