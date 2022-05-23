import React from 'react';
import {useOpenModals} from '../../../context/openModals';
import backButton from 'assets/back-button.svg';
import {
  Layout,
  ContentArea,
  HeaderArea,
  SidebarArea,
  NavArea,
  NavBackLink,
} from './styled';

type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  header?: React.ReactNode;
  nav?: React.ReactNode;
  navBackLinkTo?: string;
};

function SidebarLayout({
  children,
  header,
  sidebar,
  nav,
  navBackLinkTo,
}: SidebarLayoutProps) {
  const openModals = useOpenModals();

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (openModals.shouldDoYouWantToSaveModalOpen) {
      openModals.updateLinkToGo(path);
      openModals.openDoYouWantToSaveModal();
      event.preventDefault();
    }
  };

  return (
    <Layout>
      <NavArea>
        {navBackLinkTo && (
          <NavBackLink
            onClick={(event) => handleLinkClick(event, navBackLinkTo)}
            to={navBackLinkTo}
          >
            <img src={backButton} alt="Go back" />
          </NavBackLink>
        )}
        {nav}
      </NavArea>
      <SidebarArea>{sidebar}</SidebarArea>
      <ContentArea>{children}</ContentArea>
      <HeaderArea>{header}</HeaderArea>
    </Layout>
  );
}

export {SidebarLayout};
