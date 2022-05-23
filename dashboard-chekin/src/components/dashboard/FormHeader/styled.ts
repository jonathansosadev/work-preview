import styled from 'styled-components';
import {Heading} from "../../../styled/common";

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
`;

export const Subtitle = styled(Title)`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 16px;
  margin-top: 6px;
`;

export const TitleWrapper = styled.div`
  width: 100%;
  overflow: hidden;
`
export const PropertyHeading = styled(Heading)`
  grid-template-columns: 1fr 2fr 1fr;
  button {
    width: max-content;  
  }
`
