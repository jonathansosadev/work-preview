import styled, { css } from 'styled-components';
import Button from '../Button';

type MarketPlaceItemProps = {
  status: string;
};

type NameProps = {
  status: string;
};

export const Wrapper = styled.div`
  max-width: 298px;
  cursor: default;
`;

export const HeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const Name = styled.div<NameProps>`
  font-size: 16px;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
`;

export const ComingSoonText = styled.div`
  font-size: 13px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #7878a2;
`;

export const DisconnectWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 28px auto 0;
`;

export const ConnectedWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ConnectedImg = styled.img`
  width: 19px;
  height: 19px;
  margin-right: 8px;
  border-radius: 50%;
  box-shadow: 0 3px 6px #00000029;
`;

export const ConnectedText = styled.div`
  font-size: 15px;
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
`;

export const DescriptionText = styled.div`
  font-size: 14px;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  text-align: left;
  height: 160px;
`;

export const MarketplaceButton = styled(Button)`
  color: #fff;
  height: 40px;
  border: none;
  margin: 28px auto 0;
  text-align: center;
  background: transparent linear-gradient(164deg ,#385cf8 0%,#2148ff 100%) 0 0 no-repeat padding-box;
  box-shadow: 0 3px 4px #00020334;
  min-width: 188px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  min-width: 188px;

  div {
    height: auto;
    font-size: 15px;
    font-family: ProximaNova-Medium, sans-serif;
  }

  &:hover {
    box-shadow: none;
  }
`;

export const InfoWrapper = styled.div<MarketPlaceItemProps>`
  background: #ffffff;
  box-shadow: 0 7px 7px #369aff08;
  border-radius: 6px;
  padding: 14px 26px 24px;
  text-align: center;
  //height: 217px;
  border: 1px solid #e7ebef;

  ${(props) =>
    props.status === 'connected' &&
    css`
      border: 2px solid #385cf8;
      & ${MarketplaceButton} {
        color: #9696b9;
      }
    `};

  ${(props) =>
    props.status === 'coming' &&
    css`
      background: #cbe9ff;
    `};
`;

export const MarketplaceLogo = styled.img`
  width: 80%;
  object-fit: contain;
`;

export const MarketplaceLogoWrapper = styled.div`
  height: 71px;
  margin-bottom: 27px;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export const DisconnectButton = styled(Button)`
  border: none;
  box-shadow: none;
  color: #002cfa;
  padding: 0 9px;
`;


export const DescriptionTextPropertyConnection = styled(DescriptionText)`
  height:auto;
  margin-bottom: 30px;
`;

export const EditMappingButton = styled(MarketplaceButton)`
  min-width: auto;
  margin: 0 auto;
  margin-bottom: 40px;
  font-size:13px;
  color: #fff !important;
`;

export const DisconnectTexxt = styled.div`
  font-size: 13px;
`