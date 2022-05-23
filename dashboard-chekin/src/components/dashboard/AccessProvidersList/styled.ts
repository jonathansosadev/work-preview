import styled from 'styled-components';

export const Content = styled.div`
  max-width: 1080px;
  margin: 42px auto 40px;
  padding: 0 20px;
`;

export const Header = styled.div`
  font-size: 21px;
  font-family: ProximaNova-Bold, sans-serif;
  margin-bottom: 33px;
  text-align: left;
  color: #161643;
  cursor: pointer;
`;

export const AccessProvidersWrapper = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(auto-fill, minmax(299px, 1fr));
  column-gap: 43px;
  margin: auto;
  box-shadow: 0 0 10px #2148ff1a;
  padding: 40px 40px 40px 49px;
`;

export const AccessProviderContent = styled.div`
  justify-self: center;
  margin-bottom: 51px;
`;
