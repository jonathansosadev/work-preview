import styled, {css} from 'styled-components';
import SelectorButton from '../SelectorButton';
import {SelectorButtonProps} from '../SelectorButton/SelectorButton';

export const SelectorsWrapper = styled.div<{isTabType: boolean}>`
  ${(props) => {
    return props.isTabType
      ? css`
          height: 42px;
          background: #f4f6f8 0 0 no-repeat padding-box;
          border: 1px solid #e7ebef;
          border-radius: 6px;
          width: min-content;
          display: flex;
          align-items: center;
          box-sizing: border-box;
        `
      : css`
          margin-top: 30px;
          display: flex;
          width: 100%;
          flex-wrap: wrap;
          margin-bottom: -10px;

          .selector-button {
            margin-right: 10px;
            margin-bottom: 10px;
          }
        `;
  }}
`;

export const SelectorButtonStyled = styled(SelectorButton)<SelectorButtonProps>`
  font-size: 15px;
  color: #6b6b95;
  min-width: auto;
  background: transparent;
  box-shadow: none;
  padding: 8px 16px;
  border: 1px solid transparent;
  box-sizing: border-box;
  margin: 2px;
  white-space: nowrap;
  height: 36px;
  font-family: ProximaNova-Medium, sans-serif;
  transition-duration: 0s;

  ${(props) =>
    !props.active &&
    css`
      &:hover {
        border: 1px solid transparent;
        background: linear-gradient(
          192deg,
          rgba(56, 92, 248, 0.35) 0%,
          rgba(33, 72, 255, 0.35) 100%
        );
        color: #ffffff;
      }
    `}

  ${(props) =>
    props.active &&
    css`
      font-family: ProximaNova-Semibold, sans-serif;
      color: #ffffff;
      cursor: default;
      background: linear-gradient(192deg, #385cf8 0%, #2148ff 100%);
      box-shadow: 0 3px 4px #00020334;
      border-color: #2148ff;

      &:hover {
        opacity: 1;
        box-shadow: 0 3px 4px #00020334;
      }
    `}

  ${(props) =>
    props.readOnly &&
    !props.active &&
    css`
      cursor: default;

      &:hover {
        background: initial;
        color: #6b6b95;
      }
    `}
`;

export const LabelWrapper = styled.div`
  display: flex;
  span {
    margin-left: 5px;
  }
`;

export const Name = styled.div`
  max-width: 100%;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 16px;
  text-align: left;
  user-select: none;
  min-height: 20px;
  box-sizing: border-box;
  margin-bottom: 6px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
