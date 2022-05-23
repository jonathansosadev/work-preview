import styled, {css} from 'styled-components';
import Button from '../Button';

export const TrialHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  z-index: 300;
  opacity: 1;
  flex-wrap: wrap;
  position: relative;
  height: 30px;
  min-height: 30px;
  background: #161546;
  align-items: center;
  cursor: default;
  justify-content: center;
`;

export const TitleText = styled.div`
  font-size: 13px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #ffffff;
  text-transform: uppercase;

  & b {
    font-family: ProximaNova-Semibold, sans-serif;
    font-weight: normal;
  }
`;

export const BoldText = styled.span`
  font-family: ProximaNova-Regular, sans-serif;
`;

export const SubscribeButton = styled(Button)`
  background-color: #2352ff;
  border-radius: 3px;
  min-width: 105px;
  height: 20px;
  margin-left: 18px;
  border: none;
  padding: 0;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.disabled &&
    css`
      &,
      &:hover {
        opacity: 0.5;
      }
    `}

  div {
    height: auto;
    font-size: 13px;
    padding: 0 7px;
    font-family: ProximaNova-Regular, sans-serif;
  }
`;
