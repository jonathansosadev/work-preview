import styled, {css} from 'styled-components';
import {Link} from 'react-router-dom';
import Button from '../Button';
import {CreateOfferButtonProps} from './CreateOfferButton';

export const Container = styled.div`
  position: relative;
  width: min-content;
`;

export const StyledButton = styled(Button)`
  min-width: 152px;
`;

export const MenuItemLink = styled(Link)`
  font-family: ProximaNova-Medium, sans-serif;
  text-decoration: none;
  font-size: 16px;
  text-align: left;
  color: #161643;
  padding: 18px 0 19px 16px;
  box-sizing: border-box;
  background-color: white;
  border-bottom: 1px solid #f2f4f8;

  &:hover {
    color: #385cf8;
  }
`;

export const Menu = styled.div<Pick<CreateOfferButtonProps, 'position'>>`
  width: 200px;
  min-height: 94px;
  background: #ffffff 0 0 no-repeat padding-box;
  box-shadow: 0 0 10px #2148ff26;
  border-radius: 0 0 8px 8px;
  padding: 0 27px 0 16px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  left: 50%;
  ${getMenuPositionTransform}

  ${MenuItemLink} {
    :last-child {
      border-bottom-color: transparent;
      padding-bottom: 38px;
    }

    :first-child {
      padding-top: 35px;
    }
  }
`;

function getMenuPositionTransform({position}: Pick<CreateOfferButtonProps, 'position'>) {
  switch (position) {
    case 'bottom': {
      return css`
        transform: translateX(-50%);
      `;
    }
    case 'bottom-right': {
      return css`
        left: unset;
        right: 0;
      `;
    }
    default: {
      return css`
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
      `;
    }
  }
}
