import styled from 'styled-components';
import {BaseButton} from '../../../styled/common';
import removeIcon from '../../../assets/remove.svg';

export const Counter = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  font-size: 16px;
  margin-bottom: 25px;
`;

export const SelectedPropsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 220px);
  grid-auto-rows: 38px;
  gap: 10px;
  margin-bottom: 30px;
`;

export const SelectedPropItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 8px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  background-color: #f0f0f8;
  border: 1px solid #acacd5;
  border-radius: 4px;
  margin: 5px;
`;

export const SelectedPropText = styled.span`
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TinyDeleteBtn = styled(BaseButton)`
  width: 15px;
  min-width: 15px;
  height: 15px;
  background: #9696b9 url(${removeIcon}) no-repeat 50%/100%;
  border-radius: 3px;
`;

export const SelectButtonWrapper = styled.div`
  display: inline-block;
`;
