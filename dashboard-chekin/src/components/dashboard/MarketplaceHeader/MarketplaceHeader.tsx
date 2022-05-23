import React from 'react';
import {useLocation} from 'react-router-dom';
import {Container, Item, ItemWrapper} from './styled';
import {useTranslation} from 'react-i18next';

function MarketplaceHeader() {
  const {t} = useTranslation();
  const location = useLocation();

  const links = React.useMemo(
    () => [
      {
        to: '/marketplace/access-providers',
        label: t('access_provider'),
        visible: true,
      },
      {
        to: '/marketplace/property-protection',
        label: t('property_protection'),
        visible: true,
      },
    ],
    [t],
  );

  return (
    <Container>
      {links.map((link) => {
        if (!link.visible) {
          return null;
        }

        return (
          <ItemWrapper key={link.to} active={location.pathname.includes(link.to)}>
            <Item to={link.to}>{link.label}</Item>
          </ItemWrapper>
        );
      })}
    </Container>
  );
}

export {MarketplaceHeader};
