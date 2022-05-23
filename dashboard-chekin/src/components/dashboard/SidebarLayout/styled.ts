import styled from 'styled-components';
import {DEVICE} from 'styled/device';
import {Link} from 'react-router-dom';

export const Layout = styled.div`
  display: grid;
  grid-template-areas:
    'nav header'
    'sidebar content';
  grid-template-rows: 97px 1fr;
  grid-template-columns: 210px minmax(auto, 958px);
  justify-content: center;
  position: relative;
  left: -45px;
  padding: 0 10px;

  > * {
    position: relative;
  }

  @media (max-width: ${DEVICE.laptopM}) {
    left: 0;
  }
`;

export const NavArea = styled.nav`
  grid-area: nav;
  display: flex;
  align-items: flex-end;
`;

export const SidebarArea = styled.aside`
  grid-area: sidebar;
  margin-top: 25px;
`;

export const HeaderArea = styled.header`
  grid-area: header;
  display: flex;
  align-items: flex-end;
`;

export const ContentArea = styled.main`
  grid-area: content;
`;

export const NavBackLink = styled(Link)`
  text-decoration: none;
  width: 16px;
  height: 16px;
  cursor: pointer;
  padding: 20px calc(100% - 26px) 37px 0;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }

  > img {
    margin-top: -1px;
  }
`;
