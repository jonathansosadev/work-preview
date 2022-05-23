import styled from 'styled-components';
import {borderWithPadding} from '../styled';
import {offerMobileLayoutBreakpoint} from '../../OfferDetailsScreen/styled';

export const AvailabilityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px 22px;
  grid-template-rows: repeat(4, auto);
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  color: #161643;
  grid-auto-flow: column;
  ${borderWithPadding};

  @media (max-width: ${offerMobileLayoutBreakpoint}) {
    display: flex;
    flex-direction: column;
    font-size: 20px;
  }
`;
export const AvailabilityDuration = styled.div`
  display: flex;
  justify-content: space-between;
`;
