import styled from 'styled-components';
import {ACCOUNT_MAIN_WIDTH} from "../../../styled/common";

export const Heading = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  color: #161643;
  margin-bottom: 33px;
`;

export const CustomContractSidebarIcon = styled.img.attrs({alt: ''})`
  position: relative;
  left: 4px;
`;

export const Main = styled.main`
  width: ${ACCOUNT_MAIN_WIDTH}px;
  margin: 0 30px;
  padding-top: 40px;

  .section:first-child {
    padding-top: 0;
  }

  .section {
    border-bottom: none;
  }
`;
