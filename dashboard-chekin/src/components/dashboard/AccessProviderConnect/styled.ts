import styled from 'styled-components';
import Button from '../Button';

export const Wrapper = styled.div`
  max-width: 1080px;
  margin: 20px auto 76px;
  padding: 0 100px;
  position: relative;
`;

export const BackButtonWrapper = styled.div`
  position: absolute;
  left: 10px;
`;

export const HeaderWrapper = styled.div`
  position: relative;
  margin-bottom: 33px;
  margin-top: 20px;
`;

export const Content = styled.div`
  display: flex;
  box-shadow: 0 0 10px #2148ff1a;
  border-radius: 6px;
  padding-top: 53px;

  & > div:first-child {
    padding-right: 10px;
    padding-left: 64px;
    box-sizing: border-box;
  }
`;

export const ContentItem = styled.div`
  width: 50%;
`;

export const ProviderLogo = styled.img`
  width: 213px;
  object-fit: contain;
`;

export const ProviderLogoWrapper = styled.div`
  //height: 71px;
  margin-bottom: 24px;
`;

export const ProviderDescription = styled.div`
  max-width: 363px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  margin-bottom: 20px;
  color: #161643;
`;

export const ProviderDescriptionLink = styled.a`
  color: #0081ec;
  cursor: pointer;
`;

export const AccessProviderForm = styled.form`
  width: 293px;
  border-radius: 6px;
  margin: 0 auto;
  text-align: center;
  padding: 29px 44px 49px;
`;

export const ConnectHeader = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
`;

export const SingleFieldWrapper = styled.div`
  margin-bottom: 20px;
`;

export const SubmitButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

export const SubmitButton = styled(Button)`
  width: 80%;
  display: flex;
  margin: 0 auto;
  justify-content: center;
`;
