import styled from 'styled-components';
import Button from '../Button';
import {device} from '../../styled/device';

const maxWidth = 894;
const margin = 15;

export const Content = styled.main`
  max-width: ${maxWidth}px;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 565px;
  background-color: white;
  box-shadow: 0 0 10px #2148ff1a;
  border-radius: 6px;
  margin: ${margin}px auto;
  box-sizing: border-box;

  @media (max-width: ${maxWidth + margin * 2}px) {
    margin: ${margin}px;
    width: auto;
  }

  @media (max-width: ${device.mobileL}) {
    margin: -20px 0 0;
    box-shadow: none;
    min-height: auto;
  }
`;

export const FooterContent = styled.footer`
  width: 100%;
  min-height: 69px;
  display: grid;
  margin-top: auto;
  grid-template-areas: 'steps alt-btn btn';
  grid-template-columns: 1fr auto auto;
  align-items: center;
  box-sizing: border-box;
  padding: 0 60px;
  box-shadow: 0px -2px 3px #2148ff0a;
  border-radius: 0 0 6px 6px;

  @media (max-width: ${device.mobileL}) {
    margin-top: 0;
    justify-content: flex-end;
    padding: 20px 30px;
    position: fixed;
    bottom: 0;
    right: 0;
    background-color: white;
  }
`;

export const StepsArea = styled.div`
  grid-area: steps;
`;

export const AltButtonArea = styled.div`
  grid-area: alt-btn;
`;

export const ButtonArea = styled.div`
  grid-area: btn;
`;
export const FooterButton = styled(Button)`
  min-width: 125px;
  height: 39px;
  margin-left: 5px;

  @media (max-width: ${device.tablet}) {
    font-size: 18px;
    height: 44px;
  }
`;
