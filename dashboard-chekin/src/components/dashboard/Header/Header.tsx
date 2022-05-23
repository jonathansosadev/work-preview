import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import i18n from '../../../i18n';
import {useUser} from '../../../context/user';
import {useAuth} from '../../../context/auth';
import {downloadFromLink, getMenuOptions, MenuItemsType} from '../../../utils/common';
import {ACCOUNT_LINKS} from '../AccountSections';
import {openHubspotChat} from '../../../analytics/hubspot';
import {useOpenModals} from '../../../context/openModals';
import {UPSELLING_LINKS} from '../../../utils/links';
import chekinLogo from 'assets/tick-chekin.svg';
import helpIcon from 'assets/help-icon.svg';
import moreIcon from 'assets/more-icon.svg';
import userIcon from 'assets/account-icon.svg';
import settingsIcon from 'assets/settings.svg';
import marketplaceIcon from 'assets/marketplace-icon.svg';
import HeaderItem from '../HeaderItem';
import ImportStatusTile from '../ImportStatusTile';
import {
  Grid,
  HeaderItemImage,
  HeaderItemsDivider,
  HeaderMainNavLink,
  HeaderMainNavLinkTag,
  HeaderNavigationMenuWrapper,
  HeaderNavLink,
  HeaderText,
  HeaderWrapper,
  LogoImage,
  MoreImg,
  UserHeaderItem,
  UserHeaderItemContentWrapper,
  UserHeaderItemImage,
  UserMenuItemText,
  UserMenuWrapper,
} from './styled';

const userMenuOptions: MenuItemsType = {
  logout: {
    label: i18n.t('logout'),
    value: '/logout',
  },
};

const helpMenuOptions: MenuItemsType = {
  helpNow: {
    label: i18n.t('get_help_now'),
    value: '/help-now',
  },
  helpCenter: {
    label: i18n.t('help_center'),
    value: i18n.t('help_center_link'),
  },
};

type NavigatorMenuItem = MenuItemsType[keyof MenuItemsType] & {
  tag?: string;
  hidden?: boolean;
};

function Header() {
  const {t} = useTranslation();
  const location = useLocation();
  const {logout} = useAuth();
  const user = useUser();
  const history = useHistory();
  const openModals = useOpenModals();

  const navigatorLinks: NavigatorMenuItem[] = React.useMemo(() => {
    return [
      {
        label: i18n.t('bookings'),
        value: '/bookings',
      },
      {
        label: i18n.t('properties'),
        value: '/properties',
      },
      {
        label: i18n.t('upselling'),
        value: UPSELLING_LINKS.root,
        tag: i18n.t('new'),
        exact: false,
      },
      {
        label: i18n.t('documents_text'),
        value: '/documents/entry-form',
      },
    ];
  }, []);

  React.useEffect(() => {
    if (
      user?.import_status === 'WAITING_FOR_MAPPING' &&
      location.pathname !== '/properties/connect'
    ) {
      history.push('/properties/connect');
    }
  }, [user, history, location]);

  const handleUserItemClick = (value = '') => {
    if (value === userMenuOptions.logout.value) {
      logout();
    } else if (openModals.shouldDoYouWantToSaveModalOpen) {
      openModals.updateLinkToGo(value);
      openModals.openDoYouWantToSaveModal();
      return;
    }
  };

  const handleHelpItemClick = (value = '') => {
    if (value === helpMenuOptions.helpCenter.value) {
      downloadFromLink(helpMenuOptions.helpCenter.value);
    }

    if (value === helpMenuOptions.helpNow.value) {
      openHubspotChat();
    }
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (openModals.shouldDoYouWantToSaveModalOpen) {
      openModals.updateLinkToGo(path);
      openModals.openDoYouWantToSaveModal();
      event.preventDefault();
    }
  };

  return (
    <>
      <HeaderWrapper>
        <Grid>
          <LogoImage src={chekinLogo} alt="" />
          <HeaderNavigationMenuWrapper>
            {navigatorLinks.map((link, index) => {
              const isExact = link.exact !== false;

              if (link.hidden) {
                return null;
              }

              return (
                <HeaderMainNavLink
                  exact={isExact}
                  key={index}
                  to={link.value}
                  onClick={(event) => handleLinkClick(event, link.value)}
                  title={link.label}
                >
                  {link.tag && <HeaderMainNavLinkTag>{link.tag}</HeaderMainNavLinkTag>}
                  <HeaderText>{link.label}</HeaderText>
                </HeaderMainNavLink>
              );
            })}
          </HeaderNavigationMenuWrapper>
          <UserMenuWrapper>
            <HeaderNavLink
              to="/marketplace/access-providers"
              onClick={(event) => handleLinkClick(event, '/marketplace/access-providers')}
            >
              <HeaderItem>
                <HeaderItemImage
                  $active={location.pathname.includes('marketplace')}
                  src={marketplaceIcon}
                  title={t('marketplace')}
                  alt={t('marketplace')}
                  height={20}
                  width={21}
                />
              </HeaderItem>
            </HeaderNavLink>
            <HeaderItem
              onMenuItemClick={handleHelpItemClick}
              menuOptions={getMenuOptions(helpMenuOptions)}
            >
              {(active) => (
                <HeaderItemImage
                  $active={active}
                  src={helpIcon}
                  title={t('help')}
                  alt={t('help')}
                  height={22}
                  width={22}
                />
              )}
            </HeaderItem>
            <HeaderNavLink
              to={ACCOUNT_LINKS.details}
              onClick={(event) => handleLinkClick(event, ACCOUNT_LINKS.details)}
            >
              <HeaderItem>
                <HeaderItemImage
                  $active={location.pathname.includes('account')}
                  src={settingsIcon}
                  title={t('settings')}
                  alt={t('settings')}
                  height={20}
                  width={20}
                />
              </HeaderItem>
            </HeaderNavLink>
            <HeaderItemsDivider />
            <UserHeaderItem
              onMenuItemClick={handleUserItemClick}
              menuOptions={getMenuOptions(userMenuOptions)}
            >
              {(active) => (
                <UserHeaderItemContentWrapper $active={active}>
                  <UserHeaderItemImage height={16} width={16} src={userIcon} alt="" />
                  <UserMenuItemText>{user?.name}</UserMenuItemText>
                  <MoreImg src={moreIcon} alt="" />
                </UserHeaderItemContentWrapper>
              )}
            </UserHeaderItem>
          </UserMenuWrapper>
        </Grid>
      </HeaderWrapper>
      <ImportStatusTile />
    </>
  );
}

export {Header};
