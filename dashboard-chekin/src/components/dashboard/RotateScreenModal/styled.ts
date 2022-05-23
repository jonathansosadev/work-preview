import styled from 'styled-components';
import {baseOverlayStyle} from '../Modal';
import {DEVICE} from '../../../styled/device';

export const overlayStyle = {
  ...baseOverlayStyle,
  background: 'rgba(255,255,255, 1)',
};

export const Wrapper = styled.div`
  display: none;

  @media (max-width: ${DEVICE.tablet}) and (orientation: portrait) {
    display: block;

    .popup-overlay {
      z-index: 999 !important;
    }
  }
`;
