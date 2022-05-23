import React from 'react';
import {Container, StyledNavLink, Divider} from './styled';

export type TabButtonLink = {
  to: string;
  name: string;
  exact?: boolean;
};

type TabButtonLinksProps = {
  links: TabButtonLink[];
  className?: string;
};

function TabButtonLinks({links, className}: TabButtonLinksProps) {
  return (
    <Container className={className}>
      {links.map(({name, ...linkProps}, index) => {
        const isFirstItem = index === 0;

        return (
          <React.Fragment key={name}>
            {!isFirstItem && <Divider />}
            <StyledNavLink title={name} {...linkProps}>
              {name}
            </StyledNavLink>
          </React.Fragment>
        );
      })}
    </Container>
  );
}

export {TabButtonLinks};
