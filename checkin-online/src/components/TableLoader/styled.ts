import styled from 'styled-components';

type WrapperProps = {
  hideBorder?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  display: flex;
  justify-content: center;
  flex: 1;
  align-items: center;
  padding-top: 33px;
  padding-bottom: 48px;
  cursor: default;
  border-top: ${props => !props.hideBorder && '1px solid #f0f0f3'};
`;

export const Label = styled.span`
  margin-left: 13px;
  margin-top: -4px;
  color: #9696b9;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 14px;
  text-transform: uppercase;
  opacity: 0.5;
`;
