import styled from 'styled-components';
import {BaseButton} from '../../../styled/common';

export const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  font-family: ProximaNova-Semibold, sans-serif;
  text-align: left;
  font-size: 16px;
  color: #161643;
  padding: 13px 10px 8px 20px;
  box-shadow: 0 0 10px #6fc2ff33;
  border-radius: 6px;
  box-sizing: border-box;
  cursor: pointer;
`;

export const Name = styled.div`
  margin-bottom: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SwitchWrapper = styled.div<{active: boolean}>`
  .label {
    transition: color 0.15s ease-in-out;
    color: ${(props) => !props.active && '#ACACD5'};
  }
`;

export const ActionsGrid = styled.div`
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr 0.5fr;
  grid-auto-flow: column;
  align-content: center;
`;

export const ButtonsWrapper = styled.div`
  position: absolute;
  height: 100%;
  top: 0;
  right: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export const DeleteButton = styled(BaseButton)`
  width: 24px;
  height: 24px;
  background: linear-gradient(176deg, #ff2467 0%, #eb2461 100%);
  box-shadow: 0 3px 4px #0002032b;
  border-radius: 4px;

  > img {
    vertical-align: middle;
  }
`;
