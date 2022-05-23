import React from 'react';
import styled from 'styled-components';
import {baseContentStyle} from '../Modal';
import {BaseButton} from '../../../styled/common';
import {DEVICE} from '../../../styled/device';

export const contentStyle: React.CSSProperties = {
  ...baseContentStyle,
  minWidth: 'auto',
  height: 559,
};

export const Grid = styled.div`
  display: grid;
  grid-template-rows: 44px auto;
  grid-template-columns: minmax(auto, 300px) 1fr;
  margin-top: 35px;
  align-items: center;
  justify-content: center;
  width: 994px;
  box-sizing: border-box;
  position: relative;

  > * {
    padding: 0 24px;
  }

  @media (max-width: ${DEVICE.laptop}) {
    width: auto;
  }
`;

export const Content = styled.div`
  margin-top: 27px;
  grid-column: span 2;
`;

export const LoaderWrapper = styled.div`
  margin-top: 100px;
`;

export const PicturesGrid = styled.div`
  max-height: 397px;
  display: grid;
  grid-template-columns: repeat(auto-fit, 229px);
  grid-gap: 24px 10px;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  grid-auto-rows: 161px;

  &::after {
    content: '';
    height: 1px;
    grid-column: span 4;

    @media (max-width: ${DEVICE.laptop}) {
      grid-column: span 3;
    }
  }
`;

export const ImageWrapper = styled(BaseButton)`
  height: 100%;
  width: 100%;
  border: 1px solid transparent;
  box-sizing: border-box;
  border-radius: 6px;
  cursor: ${(props) => props.disabled && 'progress'};

  &:hover {
    border-color: #385cf8;
  }
`;

export const Image = styled.img<{$loaded: boolean}>`
  max-height: 100%;
  max-width: 100%;
  transition: all 0.2s ease-in-out;
  filter: ${(props) => !props.$loaded && 'blur(4px)'};
`;

export const CloseButtonWrapper = styled.div`
  text-align: right;
  margin-top: 20px;
`;

export const CloseButton = styled(BaseButton)`
  margin-right: 14px;
  text-align: center;
  padding: 10px;

  & > img {
    height: 15px;
    vertical-align: middle;
  }
`;

export const ArrowLeftButton = styled(BaseButton)`
  position: absolute;
  top: -3px;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to left, transparent, white 50%);
  height: 44px;
  padding: 0 24px;

  > img {
    transform: rotate(90deg);
  }

  &:hover,
  &:active {
    opacity: 1;

    > img {
      opacity: 0.8;
    }
  }
`;

export const ArrowRightButton = styled(ArrowLeftButton)`
  background: linear-gradient(to right, transparent, white 50%);
  right: 0;
  left: unset;

  > img {
    transform: rotate(-90deg);
  }
`;

export const TabLinksContainer = styled.div`
  margin-top: 4px;
  grid-column: span 2;
  position: relative;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 20px;
  margin-bottom: -22px;

  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  .container {
    justify-content: flex-start;
  }
`;
