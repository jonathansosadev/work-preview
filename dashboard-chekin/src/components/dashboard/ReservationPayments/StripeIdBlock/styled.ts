import styled from 'styled-components';
import {animated} from 'react-spring';
import {BASE_LINK_COLOR} from '../../../../styled/global';

export const AnimatedContainer = styled.div`
  margin-left: 10px;
  position: relative;
  z-index: 1;

  @media (max-width: 1060px) {
    word-break: break-all;
  }
`;

export const CloseStripeIdButton = styled.span<{disabled?: boolean}>`
  align-self: end;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
  color: ${(props) => (props.disabled ? '#9696b9' : `${BASE_LINK_COLOR}`)};
`;

type StripeIdTextProps = {
  $isActive?: boolean;
};
export const StripeIdText = styled(animated.div)<StripeIdTextProps>`
  color: #6b6b95;
  position: absolute;
  display: flex;
  bottom: 0;
  white-space: nowrap;
  font-size: 15px;
  font-family: ${(props) =>
      props.$isActive ? 'ProximaNova-Regular' : 'ProximaNova-Medium'},
    sans-serif;
  cursor: ${(props) => (props.$isActive ? 'default' : 'pointer')};
  min-width: 205px;

  & ${CloseStripeIdButton} {
    margin-left: 12px;
  }

  @media (max-width: 1060px) {
    white-space: normal;
  }
`;

export const LinkStripeId = styled.a`
  text-decoration: none;
  margin-left: 5px;
  color: #385cf8;

  &:hover {
    opacity: 0.8;
  }

  & > img {
    margin-left: 5px;
    position: relative;
    top: -1px;
  }
`;
