import styled from 'styled-components';
import OfferTile from '../OfferTile';
import Button from '../Button';

export const StyledOfferTile = styled(OfferTile)`
  width: 245px;
  border-radius: 0;
`;

export const DescriptionWrapper = styled.div`
  padding: 21px 13px 15px;
  display: flex;
  flex-direction: column;
  color: #161643;
`;

export const DescriptionTitle = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 16px;
`;

export const DescriptionText = styled.div`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 13px;
  margin: 10px 0 14px;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 3;
`;

export const PriceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ProximaNova-Semibold, sans-serif;
`;

export const Title = styled.div`
  font-size: 14px;
`;

export const Price = styled.div`
  font-size: 27px;
`;

export const StyledButton = styled(Button)`
  width: 198px;
  margin: 55px auto 22px;
  justify-content: center;
`;

export const Terms = styled.div`
  width: 199px;
  margin: auto;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 10px;
  color: #161643;
`;

export const StyledLink = styled.a`
  color: #002aed;
`;
