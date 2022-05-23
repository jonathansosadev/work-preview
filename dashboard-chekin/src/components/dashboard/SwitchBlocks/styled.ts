import styled, {css} from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 23px;
`;

export const SwitchItem = styled.div<{$isActive?: boolean; disabled?: boolean}>`
  width: 400px;
  background-color: #f2f2fa;
  border-radius: 6px;
  outline: none;
  border: 1px solid #e7ebef;
  cursor: pointer;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  color: #9696b9;
  text-align: left;
  padding: 22px 20px;
  box-sizing: border-box;
  align-items: center;
  user-select: none;
  transition: all 0.07s ease-in-out;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        border-color: #2148ff;
      }

      &:active {
        opacity: 1;
      }
    `};

  ${(props) =>
    props.$isActive &&
    css`
      background-color: #ffffff;
      border-color: #2148ff;
      color: #161643;
    `};
`;

export const BlockHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #161643;
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  color: #6b6b95;
`;
