import styled, {css} from 'styled-components';
import Button from '../Button';

type StepButtonProps = {
  visible?: boolean;
};

export const Wrapper = styled.div``;

export const StepsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 300px;
  margin-left: 19px;
  margin-top: 0;
  margin-bottom: 20px;
`;

export const StepButton = styled(Button)<StepButtonProps>`
  margin-bottom: -3px;
  min-width: 102px;
  width: 100px;
  height: 37px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};

  ${(props) =>
    props.secondary &&
    css`
      color: #2960f5;
    `};
`;

export const PagesWrapper = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  user-select: none;
  font-size: 18px;
  letter-spacing: normal;
  text-align: center;
  width: 33px;
  color: #161643;
  margin-right: 19px;
`;

export const ActivePageWrapper = styled.span`
  font-size: 28px;
  font-family: ProximaNova-Semibold, sans-serif;
`;

export const Title = styled.div`
  font-size: 15px;
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  text-transform: uppercase;
  border-bottom: 2px solid;
  cursor: default;
  display: inline-block;
  margin: 0 auto 55px;
  color: #161643;
`;

export const TitleWrapper = styled.div`
  text-align: center;
`;
