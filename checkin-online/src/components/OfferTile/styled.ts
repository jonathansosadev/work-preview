import styled, {css} from 'styled-components';
import Button from '../Button';
import {OFFER_LABELS} from './OfferTile';
import {device} from '../../styled/device';

const minHeight = '169px';
const minHeightMobile = '246px';

export const Content = styled.div`
  padding: 66px 13px 15px;
  box-sizing: border-box;
  transition: background 0.1s ease-in-out;
  background: linear-gradient(transparent, rgba(22, 22, 66, 0.77));
  min-height: ${minHeight};

  @media (max-width: ${device.mobileL}) {
    min-height: ${minHeightMobile};
    padding-top: 92px;
  }
`;

export const Container = styled.div<{backgroundURL: string}>`
  width: 246px;
  min-height: ${minHeight};
  box-shadow: 0 0 10px #00000033;
  border-radius: 6px;
  background: url(${props => props.backgroundURL}) center center no-repeat;
  background-size: cover;
  overflow-x: hidden;
  cursor: pointer;
  position: relative;

  &:hover {
    box-shadow: none;

    & ${Content} {
      background: linear-gradient(transparent, rgba(22, 22, 66, 1));
    }
  }

  @media (max-width: ${device.mobileL}) {
    width: 100%;
    border-radius: 0;
    min-height: ${minHeightMobile};
  }
`;

export const Title = styled.div`
  color: #ffffff;
  text-shadow: 0 3px 4px #0000006f;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  min-height: 24px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  @media (max-width: ${device.mobileL}) {
    font-size: 29px;
  }
`;

export const Description = styled(Title)`
  font-size: 14px;
  margin-bottom: 10px;
  text-shadow: 0 3px 4px #0000009f;
  min-height: 17px;
  white-space: nowrap;

  @media (max-width: ${device.mobileL}) {
    font-size: 20px;
  }
`;

export const PriceAndButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Price = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 28px;
  color: #ffffff;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  & .currency {
    font-size: 13px;
  }

  @media (max-width: ${device.mobileL}) {
    font-size: 41px;

    & .currency {
      font-size: 20px;
    }
  }
`;

export const BookButton = styled(Button)`
  justify-content: center;
  min-width: auto;
  padding: 0 22px;
  height: 30px;

  @media (max-width: ${device.mobileL}) {
    height: 44px;
    font-size: 20px;
  }
`;

export const Label = styled.div<{value: OFFER_LABELS}>`
  width: 130px;
  height: 27px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 12px;
  color: #ffffff;
  text-align: center;
  transform: rotate(45deg);
  line-height: 27px;
  position: absolute;
  top: 17px;
  right: -35px;
  box-shadow: -2px 4px 5px #00000029;

  ${props => {
    switch (props.value) {
      case OFFER_LABELS.selected: {
        return css`
          background-color: #35e5bc;
        `;
      }
      case OFFER_LABELS.requested: {
        return css`
          background-color: #ffc400;
        `;
      }
      default: {
        return '';
      }
    }
  }};

  @media (max-width: ${device.mobileL}) {
    width: 220px;
    height: 37px;
    line-height: 37px;
    top: 43px;
    right: -51px;
    font-size: 20px;
  }
`;
