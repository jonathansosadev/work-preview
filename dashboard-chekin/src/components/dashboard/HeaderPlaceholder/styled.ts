import styled from 'styled-components';

export const Wrapper = styled.div`
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 86px;
  width: 100%;
  background: #161643 0% 0% no-repeat padding-box;
  padding: 0 0 0 20px;
`;

export const LogoWrapper = styled.div``;

export const LogoImage = styled.img`
  max-width: 108px;
  max-height: 50px;
`;

export const Title = styled.div`
  height: 22px;
  position: absolute;
  top: 32px;
  left: 50%;
  transform: translate(-50%);

  font-size: 18px;
  font-family: ProximaNova-Semibold, sans-serif;
  letter-spacing: 0;
  color: #ffffff;
`;
