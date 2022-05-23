import React from 'react';
import {useLocation} from 'react-router-dom';
import {useOpenModals} from '../../../context/openModals';
import {
  Container,
  StyledNavLink,
  NestedStyledNavLink,
  NestedLinksContainer,
} from './styled';

type Link = {
  name: string;
  to: string;
  exact?: boolean;
  hidden?: boolean;
  extraActiveURLs?: string[];
};

export type SidebarLink = Link & {
  icon?: (active: boolean) => React.ReactNode;
  nested?: Link[];
};

type SidebarProps = {
  className?: string;
  links: SidebarLink[];
};

function Sidebar({className, links}: SidebarProps) {
  const {pathname} = useLocation();
  const openModals = useOpenModals();

  const getIsLinkActive = ({exact, to, extraActiveURLs}: Link) => {
    const isActive = (url: string) => (exact ? pathname === url : pathname.includes(url));

    if (extraActiveURLs?.length) {
      return [to, ...extraActiveURLs].some(isActive);
    }
    return isActive(to);
  };

  const getIsSidebarLinkActive = (link: SidebarLink) => {
    const hasNested = Boolean(link.nested?.length);

    if (hasNested) {
      return link.nested!.some(getIsLinkActive);
    }
    return getIsLinkActive(link);
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (openModals.shouldDoYouWantToSaveModalOpen) {
      openModals.updateLinkToGo(path);
      openModals.openDoYouWantToSaveModal();
      event.preventDefault();
    }
  };

  return (
    <Container className={className}>
      {links.map((link) => {
        const isActive = getIsSidebarLinkActive(link);
        const hasNested = Boolean(link.nested?.length);

        if (link.hidden) {
          return null;
        }

        return (
          <React.Fragment key={link.name}>
            <StyledNavLink
              className={isActive ? 'account-active-link' : ''}
              exact={link.exact}
              to={link.to}
              $activeCursor={pathname.startsWith(link.to) ? 'default' : 'pointer'}
              onClick={(e) => handleLinkClick(e, link.to)}
            >
              <div>{link.icon?.(isActive)}</div>
              {link.name}
            </StyledNavLink>
            {isActive && hasNested && (
              <NestedLinksContainer>
                {link.nested?.map((nestedLink, index) => {
                  const isNestedLinkActive = getIsLinkActive(nestedLink);

                  if (nestedLink.hidden) {
                    return null;
                  }

                  return (
                    <NestedStyledNavLink
                      key={index}
                      className={isNestedLinkActive ? 'account-active-link' : ''}
                      $activeCursor={
                        pathname.startsWith(nestedLink.to) ? 'default' : 'pointer'
                      }
                      exact={nestedLink.exact}
                      to={nestedLink.to}
                      onClick={(e) => handleLinkClick(e, nestedLink.to)}
                    >
                      {nestedLink.name}
                    </NestedStyledNavLink>
                  );
                })}
              </NestedLinksContainer>
            )}
          </React.Fragment>
        );
      })}
    </Container>
  );
}

export {Sidebar};
