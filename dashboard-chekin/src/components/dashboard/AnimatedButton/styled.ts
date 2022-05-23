import styled from 'styled-components';
import {animated} from 'react-spring';

export const ButtonWrapper = styled.div`
  position: relative;
  max-width: 150px;
`;

export const Title = styled.span`
  color: #161643;
`;

export const BlockAnimation = styled(animated.div)`
  height: 38px;
  width: 170px;
  padding: 10px;
  position: absolute;
  box-shadow: 0 0 30px #2699fb33;
  background: #ffffff;
  border-radius: 6px;
  left: 75%;
  top: -20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  z-index: 1;
`;

export const ImageArrowAnimation = styled(animated.img)`
  position: absolute;
`;

export const IconsBlockAnimation = styled(animated.div)`
  margin-right: 22px;
`;
