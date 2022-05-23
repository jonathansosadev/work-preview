import styled from 'styled-components';
import {SectionTagWrapperProps} from './SectionTag';

export const SectionTagWrapper = styled.div<SectionTagWrapperProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0 16px;
  background: ${(props) => props.color};
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
  color: #ffffff;
  height: 26px;
  margin-left: 20px;
  margin-top: -4px;
  position: relative;
`;
