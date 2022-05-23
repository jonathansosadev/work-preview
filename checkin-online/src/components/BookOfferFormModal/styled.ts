import styled from 'styled-components';

const contentWidth = '435px';

export const Content = styled.div`
  padding: 26px 48px;
  text-align: left;
  width: 435px;
  box-sizing: border-box;

  @media (max-width: ${contentWidth}) {
    width: auto;
    padding: 26px 20px;
  }
`;

export const Title = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  color: #161643;
  margin-bottom: 21px;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  margin-top: 40%;
  justify-content: center;
  margin-bottom: 40px;
`;
