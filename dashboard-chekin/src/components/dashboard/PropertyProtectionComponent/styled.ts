import styled from 'styled-components';
import Button from '../Button';

export const Wrapper = styled.div`
  max-width: 1080px;
  margin: 20px auto 76px;
  padding: 0px 100px;
  position: relative;
`;

export const HeaderWrapper = styled.div`
  position: absolute;
  left: 10px;
`;

export const Content = styled.div`
  display: flex;
  box-shadow: rgb(33 72 255 / 10%) 0px 0px 10px;
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
  margin-bottom: 36px;
`;

export const ProviderLogoWrapper = styled.div`
  height: 71px;
  margin-bottom: 36px;
`;

export const ProviderDescription = styled.div`
  width: 300px;
  font-family: ProximaNova-Medium, sans-serif;
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
    margin: 0px auto;
    text-align: center;
    padding: 29px 44px 49px
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
  width: 90%;
  display: flex;
  justify-content: center;
`;

export const HeaderWrapperText = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;  
  position: relative;
  margin-bottom: 33px;
  margin-top: 20px;
`
export const ListDotElement = styled.p`
  margin: 0 0 0 20px;
`
