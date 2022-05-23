import React from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {SelectOption} from '../../../utils/types';
import {LOCK_VENDOR_OPTIONS, LOCK_VENDORS} from '../../../utils/constants';
import propertyIcon from '../../../assets/icon-property-key.svg';
import Modal from '../Modal';
import Select from '../Select';
import ModalButton from '../ModalButton';
import RemoteAccessProviderDetails from '../RemoteAccessProviderDetails';
import {
  FieldsWrapper,
  Container,
  ButtonsWrapper,
  contentStyle,
  NextButton,
  ManualBoxButton,
  MarketplaceConnectionText,
  CancelButtonWrapper,
} from './styled';

const vendorOptions = Object.values(LOCK_VENDOR_OPTIONS);
const MARKETPLACE_VENDORS = [LOCK_VENDORS.akiles, LOCK_VENDORS.remotelock, LOCK_VENDORS.nuki];

const MARKETPLACE_LINKS: {[key: string]: string} = {
  [LOCK_VENDORS.akiles]: '/marketplace/access-providers/Akiles',
  [LOCK_VENDORS.remotelock]: '/marketplace/access-providers/Remotelock',
  [LOCK_VENDORS.nuki]: '/marketplace/access-providers/nuki',
};

function getIsMarketplaceVendor(vendorOption: SelectOption | null) {
  if (!vendorOption) {
    return false;
  }

  return MARKETPLACE_VENDORS.includes(vendorOption.value as LOCK_VENDORS);
}

type RemoteAccessSelectProviderModalProps = {
  open: boolean;
  onClose: () => void;
  onFinish: () => Promise<void>;
};

const defaultProps: RemoteAccessSelectProviderModalProps = {
  open: false,
  onClose: () => {},
  onFinish: async () => {},
};

function RemoteAccessSelectProviderModal({
  open,
  onFinish,
  onClose,
}: RemoteAccessSelectProviderModalProps) {
  const {t} = useTranslation();
  const [selectedProvider, setSelectedProvider] = React.useState<SelectOption | null>(
    null,
  );
  const [isProviderDetails, setIsProviderDetails] = React.useState(false);
  const isMarketplaceVendor = React.useMemo(() => {
    return getIsMarketplaceVendor(selectedProvider);
  }, [selectedProvider]);

  const handleProviderChange = (option: SelectOption) => {
    setSelectedProvider(option);
  };

  const goToProviderDetails = () => {
    setIsProviderDetails(true);
  };

  const goBackFromProviderDetails = () => {
    setIsProviderDetails(false);

    if (selectedProvider?.value === LOCK_VENDORS.manualBox) {
      setSelectedProvider(null);
    }
  };

  const handleManualBoxAdd = () => {
    setSelectedProvider({
      value: LOCK_VENDORS.manualBox,
      label: LOCK_VENDORS.manualBox,
    });
    goToProviderDetails();
  };

  const goToMarketplace = () => {
    const marketplaceLink = MARKETPLACE_LINKS[selectedProvider!.value];

    if (marketplaceLink) {
      window.open(marketplaceLink);
      onClose();
    } else {
      toast.warn(`Marketplace link is missing for the ${selectedProvider?.label}`);
    }
  };

  return (
    <Modal
      iconSrc={propertyIcon}
      iconAlt="Property with a key"
      iconProps={{height: 84, width: 84}}
      title={t('add_an_account')}
      open={open}
      contentStyle={contentStyle}
    >
      <Container>
        {isProviderDetails && !isMarketplaceVendor && selectedProvider && (
          <RemoteAccessProviderDetails
            selectedProvider={selectedProvider.value}
            onFinish={onFinish}
            goBackFromProviderDetails={goBackFromProviderDetails}
          />
        )}
        {isProviderDetails && isMarketplaceVendor && (
          <div>
            <MarketplaceConnectionText>
              {t('link_account_from_marketplace')}
            </MarketplaceConnectionText>
            <NextButton visible label={t('link_my_account')} onClick={goToMarketplace} />
            <CancelButtonWrapper>
              <ModalButton
                secondary
                label={t('cancel')}
                onClick={goBackFromProviderDetails}
              />
            </CancelButtonWrapper>
          </div>
        )}
        {!isProviderDetails && (
          <>
            <FieldsWrapper>
              <Select
                label={t('select_provider')}
                placeholder={t('select_provider')}
                options={vendorOptions}
                value={selectedProvider}
                onChange={handleProviderChange}
              />
            </FieldsWrapper>
            <ManualBoxButton onClick={handleManualBoxAdd}>
              {t('do_you_have_a_manual_box')}
            </ManualBoxButton>
            <ButtonsWrapper>
              <NextButton
                visible={Boolean(selectedProvider)}
                label={t('next')}
                onClick={goToProviderDetails}
              />
              <ModalButton secondary label={t('cancel')} onClick={onClose} />
            </ButtonsWrapper>
          </>
        )}
      </Container>
    </Modal>
  );
}

RemoteAccessSelectProviderModal.defaultProps = defaultProps;
export {RemoteAccessSelectProviderModal};
