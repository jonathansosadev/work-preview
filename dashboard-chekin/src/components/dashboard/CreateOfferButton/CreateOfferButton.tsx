import React from 'react';
import {useTranslation} from 'react-i18next';
import i18n from 'i18next';
import {useModalControls, useOutsideClick} from '../../../utils/hooks';
import {useEscapeKeydown} from '../../../hooks/useEscapeKeydown';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {useUser} from '../../../context/user';
import {getIsAccountManager} from '../../../utils/user';
import {TEMPLATE_URL_PARAM} from '../OfferDetails/OfferDetails';
import {OFFER_TEMPLATES} from 'utils/upselling';
import {UPSELLING_LINKS} from '../../../utils/links';
import offerIcon from '../../../assets/Offer-icon.svg';
import MissingPaymentSettingsModal from '../MissingPaymentSettingsModal';
import {StyledButton, Menu, MenuItemLink, Container} from './styled';

const menuLinks = [
  {title: i18n.t('custom_deal'), url: UPSELLING_LINKS?.offersDetails},
  {
    title: i18n.t('early_checkin'),
    url: `${UPSELLING_LINKS?.offersDetails}?${TEMPLATE_URL_PARAM}=${OFFER_TEMPLATES.checkIn}`,
  },
  {
    title: i18n.t('late_checkout'),
    url: `${UPSELLING_LINKS?.offersDetails}?${TEMPLATE_URL_PARAM}=${OFFER_TEMPLATES.checkOut}`,
  },
  {
    title: i18n.t('waivo_dp_price', {price: '$1,500'}),
    url: `${UPSELLING_LINKS?.offersDetails}?${TEMPLATE_URL_PARAM}=${OFFER_TEMPLATES.waivo1500}`,
  },
  {
    title: i18n.t('waivo_dp_price', {price: '$2,500'}),
    url: `${UPSELLING_LINKS?.offersDetails}?${TEMPLATE_URL_PARAM}=${OFFER_TEMPLATES.waivo2500}`,
  },
  {
    title: i18n.t('waivo_dp_price', {price: '$5,000'}),
    url: `${UPSELLING_LINKS?.offersDetails}?${TEMPLATE_URL_PARAM}=${OFFER_TEMPLATES.waivo5000}`,
  },
];

export type CreateOfferButtonProps = {
  className?: string;
  position?: 'center' | 'bottom' | 'bottom-right';
  onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>, path: string) => void;
};

const defaultProps: CreateOfferButtonProps = {
  position: 'center',
};

function CreateOfferButton({className, position, onLinkClick}: CreateOfferButtonProps) {
  const {t} = useTranslation();
  const user = useUser();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const {
    isOpen: isMenuOpen,
    openModal: openMenu,
    closeModal: closeMenu,
  } = useModalControls();
  useOutsideClick(containerRef, closeMenu);
  useEscapeKeydown(closeMenu);

  const {hasPaymentSettings} = usePaymentSettings();
  const isAccountManager = getIsAccountManager(user);

  const {
    isOpen: isMissingPaymentSettingsModalOpen,
    closeModal: closeMissingPaymentSettingsModal,
    openModal: openMissingPaymentSettingsModal,
  } = useModalControls();

  const handleClick = () => {
    if (!hasPaymentSettings && !isAccountManager) openMissingPaymentSettingsModal();
    else openMenu();
  };

  return (
    <Container className={className}>
      <StyledButton
        onClick={handleClick}
        icon={<img src={offerIcon} alt="" height={22} width={21} />}
        label={t('create_deal')}
      />
      {isMenuOpen && (
        <Menu ref={containerRef} position={position}>
          {menuLinks.map(({title, url}) => (
            <MenuItemLink
              key={url}
              onClick={(event) => {
                onLinkClick?.(event, url);
              }}
              to={url}
            >
              {title}
            </MenuItemLink>
          ))}
        </Menu>
      )}

      <MissingPaymentSettingsModal
        open={isMissingPaymentSettingsModalOpen}
        onClose={closeMissingPaymentSettingsModal}
      />
    </Container>
  );
}

CreateOfferButton.defaultProps = defaultProps;
export {CreateOfferButton};
