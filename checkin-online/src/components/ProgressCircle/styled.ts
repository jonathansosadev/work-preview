import styled from 'styled-components';
import {animated} from 'react-spring';

export const Figure = styled.figure`
  height: 160px;
  width: 160px;
`;

export const Svg = styled.svg`
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
`;

export const ErrorText = styled.tspan`
  font-family: ProximaNova-Bold, sans-serif;
  fill: #b41c52;
  font-size: 40%;
`;

export const WarningText = styled.tspan`
  font-family: ProximaNova-Bold, sans-serif;
  fill: #ffc400;
  font-size: 30%;
`;

export const AnimatedText = styled(animated.tspan)`
  font-family: ProximaNova-Bold, sans-serif;
  fill: white;
  font-size: 13px;
`;

export const Text = styled.text`
  font-family: ProximaNova-Bold, sans-serif;
  fill: white;
  font-size: 3.2px;
`;

export const ProgressSymbol = styled.tspan`
  font-size: 5px;
  font-family: ProximaNova-Bold, sans-serif;
  fill: white;
`;
