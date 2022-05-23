import styled, {css} from 'styled-components';
import {Text as ModalText} from '../Modal/styled';
import DefaultButton from '../Button';

export const BannerContainer = styled.div`
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
  z-index: 50000;
  top: 40%;
  right: 50px;
  background: white;
  box-shadow: 0 10px 30px #02030857;
  border-radius: 6px;
  padding: 13px 11px;
  width: 218px;
  height: auto;
  & button {
    justify-content: center;
  }
`;

export const ImageWrapper = styled.div`
  width: 100%;

  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const Text = styled(ModalText)`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  line-height: 1.8;
  text-align: left;
  margin: 0;
`;

export const Button = styled(DefaultButton)`
  margin: auto auto 18px;
`;

const defaultCrossSize = 16;
type CloseButtonProps = {
  crossSize?: number;
};
export const CloseButton = styled.button<CloseButtonProps>`
  position: absolute;
  border-radius: 100%;
  background: white;
  ${({crossSize = defaultCrossSize}) =>
    crossSize &&
    css`
      width: ${crossSize * 2}px;
      height: ${crossSize * 2}px;
      padding: ${crossSize / 2}px;
      right: ${-crossSize / 1.5}px;
      top: ${-(crossSize / 1.5)}px;
      & img {
        width: ${crossSize}px;
      }
    `};
`;

export const TryUpsellingDescription = styled.div`
  margin: 10px 10px 18px;

  h3 {
    font-family: ProximaNova-Semibold, sans-serif;
    font-size: 16px;
    margin: 0;
  }

  p {
    margin: 0;
  }
`;

export const FeedbackDescription = styled.div`
  margin: 20px 10px;
`;
