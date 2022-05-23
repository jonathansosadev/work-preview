import styled from 'styled-components';

export const ImportStatusTileContainer = styled.div`
  position: fixed;
  right: 20px;
  top: 14px;
  width: 150px;
  border-radius: 6px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  background-color: #ffffff;
  z-index: 999;
  padding: 30px 60px 0;
  text-align: center;
`;

export const ImportStatusImg = styled.img`
  width: 110px;
  margin-bottom: 20px;
`;

export const ImportStatusText = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 14px;
  line-height: 1.38;
  color: #161643;
  margin-bottom: 30px;
`;

export const CloseButton = styled.a`
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
`;

export const CloseButtonImg = styled.img`
  width: 16px;
  height: 16px;
`;

export const Wrapper = styled.div`
  cursor: default;
  max-width: 770px;
  margin-bottom: 57px;
  box-sizing: border-box;
`;

export const ImportedHousingsImage = styled.img`
  text-align: center;
  width: 113px;
  height: 56px;
  margin-top: 27px;
  margin-bottom: 15px;
`;

export const CongratsImage = styled.img`
  text-align: center;
  width: 57px;
  height: 56px;
  margin-top: 25px;
  margin-bottom: 12px;
`;

export const RelaxImage = styled.img`
  width: 80px;
  height: 97px;
  margin-top: 38px;
  margin-bottom: 27px;
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 20px;
  text-align: center;
  color: #182e56;
  text-transform: capitalize;
`;

export const FinalTitle = styled(Title)`
  text-transform: none;
`;

export const SubTitle = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  text-align: center;
  color: #161643;
`;

export const Content = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 13px;
  letter-spacing: normal;
  text-align: center;
  width: 207px;
  margin: 10px auto;
  color: #2d508e;
`;

export const ConfirmationButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  margin-bottom: -9px;

  & button {
    font-size: 15px;
    height: 30px;
    min-width: 50px;
  }
`;

export const LoaderWrapper = styled.div`
  margin: auto;
`;

export const TextContainer = styled.div`
  text-align: left;
  color: #2d508e;
  margin-top: 10px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  line-height: 1.2;
`;

export const ListItemTextContainer = styled.div`
  margin-left: 15px;
  margin-top: 4px;
  color: #2d508e;
  text-align: left;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  line-height: 1.2;
`;

export const Link = styled.a`
  margin: 0 10px;
  color: #0081ec;
  cursor: pointer;
`;

export const LinkContent = styled.div`
  display: flex;
  align-items: center;
`;

export const Info = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 55px 0;
`;

export const InfoImg = styled.img`
  width: 53px;
  margin-right: 15px;
`;

export const InfoContent = styled.div`
  color: #2d508e;
  text-align: center;
`;

export const ButtonsWrapper = styled.div`
  display: inline-grid;

  & button {
    margin-bottom: 15px;
  }
`;

export const ImportText = styled.div`
  text-align: center;
  margin-top: 16px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  margin-bottom: 30px;

  & > b {
    font-family: ProximaNova-Semibold, sans-serif;
    font-size: 16px;
  }
`;

export const WelcomeText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 13px;
  margin-bottom: 30px;
  text-align: left;
  max-width: 242px;
  margin-left: 55px;
  align-self: flex-start;

  & > b {
    font-family: ProximaNova-Semibold, sans-serif;
  }

  & > span {
    display: inline-block;

    &:first-letter {
      padding-left: 1em;
    }
  }
`;

export const ImportColumn = styled.div`
  width: 332px;
  text-align: center;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;

  & > img {
    width: 152px;
    height: 152px;
  }
`;

export const WelcomeColumn = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: -20px;

  & > img {
    margin-right: -27px;
    margin-bottom: -60px;
    width: 360px;
    height: 256px;
  }
`;

export const TwoColumnsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 30px 50px 0;

  & > ${ImportColumn}:first-child {
    margin-right: 42px;
  }

  & > ${WelcomeColumn}:first-child {
    align-items: flex-start;

    & > img {
      margin-left: -30px;
      margin-right: 20px;
    }

    & ${WelcomeText} {
      margin-left: 25px;
    }
  }
`;

export const ListWrapper = styled.div`
  padding: 0 140px;
  text-align: center;
  margin-bottom: 40px;
`;

export const List = styled.ul`
  margin-top: 36px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 15px;
  color: #161643;
  text-align: left;
  margin-bottom: 0;

  & > li:not(:last-child) {
    margin-bottom: 25px;
  }
`;

export const SkipButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  color: #0081ec;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  padding: 5px;
  position: absolute;
  top: 22px;
  right: 30px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;
