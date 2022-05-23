import styled from 'styled-components';
import {animated} from 'react-spring';
import {BASE_LINK_COLOR} from '../../../../styled/global';

export const AnimatedContainer = styled.div<{isActive: boolean}>`
  position: relative;
  margin-top: 4px;
  z-index: 1;
  width: 100%;
  height: ${(props) => (props.isActive ? '60px' : '18px')};
  transition: height 180ms ease-in-out;
`;

export const CloseStripeIdButton = styled.span<{disabled?: boolean}>`
  align-self: end;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  color: ${(props) => (props.disabled ? '#9696b9' : `${BASE_LINK_COLOR}`)};
`;

type StripeIdTextProps = {
  isActive?: boolean;
};
export const StripeIdText = styled(animated.div)<StripeIdTextProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  width: 153px;
  top: 0;
  color: #6b6b95;
  font-size: 14px;
  font-family: ${(props) =>
      props.isActive ? 'ProximaNova-Regular' : 'ProximaNova-Medium'},
    sans-serif;
  cursor: ${(props) => (props.isActive ? 'default' : 'pointer')};

  & ${CloseStripeIdButton} {
    margin-left: 12px;

    &:hover {
      opacity: 0.8;
    }
  }
`;

export const LinkStripeId = styled.a`
  text-decoration: none;
  color: #385cf8;
  word-break: break-all;
  text-align: center;

  &:hover {
    opacity: 0.8;
  }

  & > img {
    margin-left: 5px;
  }
`;
