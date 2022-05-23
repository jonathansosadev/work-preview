import React from 'react';
import {useSubscription} from '../../../context/subscription';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import subscriptionAskIcon from '../../../assets/subscription-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

export type SubscriptionAskModalProps = {
  open?: boolean;
  onClose?: () => void;
};

const defaultProps: SubscriptionAskModalProps = {
  open: false,
  onClose: () => {},
};

function SubscriptionAskModal({open, onClose}: SubscriptionAskModalProps) {
  const {t} = useTranslation();
  const {isSubscriptionCanceled} = useSubscription();

  return (
    <Modal
      iconSrc={subscriptionAskIcon}
      iconAlt="A hand pointing to subscription"
      title={
        isSubscriptionCanceled ? t('you_are_not_subscribed') : t('your_trial_has_ended')
      }
      text={t('please_choose_a_plan_and_restart_subscription')}
      open={open}
    >
      <ModalTwoButtonsWrapper>
        <Link to="/subscription/number">
          <ModalButton label={t('subscribe_now')} />
        </Link>
        <ModalButton secondary label={t('cancel')} onClick={onClose} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

SubscriptionAskModal.defaultProps = defaultProps;
export {SubscriptionAskModal};
