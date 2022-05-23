import React from 'react';
import {useTranslation} from 'react-i18next';
import {useOutsideClick} from '../../utils/hooks';
import xIcon from '../../assets/x_blue.svg';
import {Container, StyledNavLink, NavButton, MobileMenuButton, Wrapper} from './styled';

export type TabLink<TLink = string> = {
  to: TLink;
  name: string;
  exact?: boolean;
};

type TabLinksProps<TLinks> = {
  links: TabLink<TLinks>[];
  asButtons?: {
    onChange: (nextActive: TLinks) => void;
    active: TLinks;
  };
  mobileTrigger?: string;
  className?: string;
};

function TabLinks<TLinks = string>({
  className,
  links,
  asButtons,
  mobileTrigger,
}: TabLinksProps<TLinks>) {
  const {t} = useTranslation();
  const triggerText = mobileTrigger || t('filter');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const toggleIsMobileMenuOpen = () => {
    setIsMobileMenuOpen(prevState => !prevState);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useOutsideClick(menuRef, closeMobileMenu);

  return (
    <Wrapper ref={menuRef} className={className}>
      <MobileMenuButton onClick={toggleIsMobileMenuOpen}>
        {isMobileMenuOpen ? <img src={xIcon} alt="Close filters" /> : triggerText}
      </MobileMenuButton>
      <Container
        className="menu"
        isVisibleOnMobile={isMobileMenuOpen}
        onClick={closeMobileMenu}
      >
        {links.map(({name, ...linkProps}) => {
          if (asButtons) {
            return (
              <NavButton
                type="button"
                key={name}
                title={t(name)}
                $active={asButtons.active === linkProps.to}
                onClick={() => asButtons.onChange(linkProps.to)}
              >
                {t(name)}
              </NavButton>
            );
          }

          return (
            <StyledNavLink key={name} title={t(name)} {...linkProps}>
              {t(name)}
            </StyledNavLink>
          );
        })}
      </Container>
    </Wrapper>
  );
}

export {TabLinks};
