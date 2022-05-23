import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import paymentIcon from 'assets/payment-icon.svg';
import {ACCOUNT_LINKS} from '../AccountSections';
import {useUser} from '../../../context/user';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {PAYMENT_PROVIDERS} from '../../../utils/constants';
import {useModalControls} from '../../../utils/hooks';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {CustomCheckbox} from '../Checkbox';
import {Text, ButtonWrapper, CheckboxWrapper} from './styled';

const USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY =
  'userPaymentsProviderIncompleteModalDenied';

function UserPaymentsProviderIncompleteModal() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const user = useUser();
  const {paymentSettings} = usePaymentSettings();
  const {isOpen, closeModal, openModal} = useModalControls();
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);

  const hasAnyPayments = user?.are_any_payments_activated;
  const isStripeInvalid =
    paymentSettings?.provider === PAYMENT_PROVIDERS.stripe &&
    paymentSettings.status !== 'VALID';

  const isModalDenied =
    localStorage.getItem(USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY) ===
    'true';
  const isAtPaymentSettingsURL = location.pathname.includes(
    ACCOUNT_LINKS.paymentSettings,
  );
  const isNeedToShowModal =
    !isModalDenied && !isAtPaymentSettingsURL && hasAnyPayments && isStripeInvalid;

  React.useLayoutEffect(() => {
    if (isNeedToShowModal) {
      openModal();
    }
  }, [isNeedToShowModal, openModal]);

  const handleModalClose = () => {
    if (isCheckboxChecked) {
      localStorage.setItem(
        USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY,
        'true',
      );
    }

    closeModal();
  };
  const goToPaymentSettings = () => {
    handleModalClose();
    history.push(ACCOUNT_LINKS.paymentSettings);
  };

  const toggleCheckbox = () => {
    setIsCheckboxChecked((prevState) => !prevState);
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleModalClose}
      title={t('payment_provider_incomplete')}
      iconProps={{
        src: paymentIcon,
        alt: '',
        height: 84,
        width: 84,
      }}
    >
      <Text>
        <Trans i18nKey="user_payments_provider_incomplete_text">
          You have some one or more properties with payments services activated but your
          payment provider setup is incomplete.
          <p>
            Payments won't be processed until you complete the payment provider setup.
          </p>
        </Trans>
      </Text>
      <CheckboxWrapper>
        <CustomCheckbox
          checked={isCheckboxChecked}
          onChange={toggleCheckbox}
          label={t('dont_show_anymore')}
        />
      </CheckboxWrapper>
      <ButtonWrapper>
        <ModalButton label={t('complete_setup')} onClick={goToPaymentSettings} />
        <ModalButton secondary label={t('close')} onClick={handleModalClose} />
      </ButtonWrapper>
    </Modal>
  );
}

export {
  UserPaymentsProviderIncompleteModal,
  USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY,
};
