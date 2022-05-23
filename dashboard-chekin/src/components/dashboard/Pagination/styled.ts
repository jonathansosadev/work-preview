import styled, {css} from 'styled-components';

const pageButtonHeight = 19;

type PageButtonProps = {
  active?: boolean;
};

export const Wrapper = styled.div`
  display: flex;
  margin: 21px 0 0;
  justify-content: center;
`;

export const PageControlButton = styled.button`
  font-family: ProximaNova-Medium, sans-serif;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 11px;
  color: #0081ec;
  font-stretch: normal;
  font-style: normal;
  text-transform: uppercase;
  padding: 0 22px;
  cursor: pointer;
  user-select: none;
  height: ${pageButtonHeight}px;
  line-height: ${pageButtonHeight}px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.12;
      pointer-events: none;
    `};
`;

export const PageButton = styled.button<PageButtonProps>`
  font-family: ProximaNova-Light, sans-serif;
  padding: 0 0 1px;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 12px;
  text-align: center;
  width: 15px;
  margin: 0 3px;
  line-height: 18px;
  cursor: pointer;
  user-select: none;
  height: ${pageButtonHeight - 1}px;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  ${(props) =>
    props.active &&
    css`
      font-family: ProximaNova-Bold, sans-serif;
      font-size: 15px;
      pointer-events: none;
    `};
`;

export const LastPageButton = styled(PageButton)`
  width: auto;
  margin-right: 0;
  min-width: 68px;

  & :first-child {
    margin: 0 8px;
  }
`;

export const PrevPagesButton = styled(LastPageButton)`
  min-width: 35px;

  & :first-child {
    margin-left: 0;
  }
`;

export const PageButtonText = styled.span`
  margin: 0 5px;
`;

export const RightDivider = styled.span`
  height: 15px;
  margin-top: 1px;
  margin-right: 5px;
  border-right: solid 1px #7598c9;
`;

export const LeftDivider = styled(RightDivider)`
  margin-left: 5px;
`;
