import React from 'react';
import {Container, StyledNavLink, NavButton} from './styled';

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
  className?: string;
};

function TabLinks<TLinks = string>({className, links, asButtons}: TabLinksProps<TLinks>) {
  return (
    <Container className={`${className} container`}>
      {links.map(({name, ...linkProps}) => {
        if (asButtons) {
          return (
            <NavButton
              type="button"
              key={name}
              title={name}
              $active={asButtons.active === linkProps.to}
              onClick={() => asButtons.onChange(linkProps.to)}
            >
              {name}
            </NavButton>
          );
        }

        return (
          <StyledNavLink key={name} title={name} {...linkProps}>
            {name}
          </StyledNavLink>
        );
      })}
    </Container>
  );
}

export {TabLinks};
