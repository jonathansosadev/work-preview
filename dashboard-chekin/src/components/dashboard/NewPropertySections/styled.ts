import styled from 'styled-components';
import {ACCOUNT_MAIN_WIDTH} from 'styled/common';

export const Heading = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 21px;
  color: #161643;
  margin-bottom: 33px;
`;

export const SidebarIcon = styled.img.attrs({alt: ''})`
  vertical-align: middle;
`;

export const AccountContent = styled.div`
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: 215px 1fr;
  grid-template-rows: 1fr;
  justify-items: center;
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

export const Sidebar = styled.aside`
  box-sizing: border-box;
  justify-content: center;
  width: 100%;
  padding-top: 40px;
  padding-left: 16px;
  background-color: #f4f4fa;
`;
