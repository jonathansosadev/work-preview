import styled from 'styled-components';

export const Wrapper = styled.div`
  position: fixed;
  top: 124px;
  right: 32px;
  z-index: 301;
  width: 284px;
  height: 574px;
  will-change: transform;
  cursor: move;
  user-select: none;

  @media (min-width: 1920px) {
    right: 10%;
  }
`;

type BackgroundProps = {
  isDragging: boolean;
};

export const Background = styled.div<BackgroundProps>`
  position: absolute;
  z-index: -1;
  top: 33px;
  right: 19px;
  height: 521px;
  width: 246px;
  transition: box-shadow 0.1s ease-in-out;
  box-shadow: ${(props) =>
    props.isDragging ? '0' : '16px 16px 31px rgb(199 199 199 / 65%)'};
  border-radius: 36px;
`;

export const ContainerImage = styled.img`
  position: absolute;
  top: 0;
  right: 0;
  width: 284px;
  height: 574px;
`;

export const Content = styled.div`
  position: absolute;
  top: 39px;
  right: 20px;
  height: 515px;
  width: 245px;
  background-color: transparent;
  padding: 0;
  box-sizing: border-box;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  cursor: default;
  overflow: hidden;
`;

export const ContentMessage = styled.div`
  position: absolute;
  top: 0;
  bottom: 73px;
  right: 0;
  left: 0;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 25px;
  color: #9696b9;
  padding: 20px;
  text-align: center;
`;
