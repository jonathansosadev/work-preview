import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link} from 'react-router-dom';
import {Guest} from '../../../utils/types';
import {useReservation} from '../../../context/reservation';
import {getMembers} from '../../../utils/reservation';
import {useComputedReservationDetails} from '../../../context/computedReservationDetails';
import Modal from '../../Modal';
import Button from '../../Button';
import {
  Content,
  Subtitle,
  Title,
  Guests,
  GuestRow,
  SelectButton,
  BottomButtonWrapper,
} from './styled';

type PayingGuestSelectionModalProps = {
  onClose: () => void;
  onSelect: (guest: Guest) => void;
  loading: boolean;
};

function PayingGuestSelectionModal({
  onClose,
  onSelect,
  loading,
}: PayingGuestSelectionModalProps) {
  const {t} = useTranslation();
  const {data: reservation} = useReservation();
  const {isSomePayments} = useComputedReservationDetails();
  const guests: Guest[] = getMembers(reservation);
  const isFirstGuest = !guests.length;

  return (
    <Modal open closeOnDocumentClick closeOnEscape onClose={onClose}>
      <Content>
        <Title>{t('whos_purchasing_deal')}</Title>
        <Subtitle>
          {t(isFirstGuest ? 'you_are_first_guest_register' : 'select_guest_from_list')}
        </Subtitle>
        <Guests>
          {guests.map(guest => {
            return (
              <GuestRow key={guest.id}>
                {guest.name}
                <SelectButton
                  label={t('select')}
                  onClick={() => {
                    onSelect(guest);
                  }}
                />
              </GuestRow>
            );
          })}
        </Guests>
        {!isSomePayments && (
          <BottomButtonWrapper>
            <Link to="/">
              <Button
                label={
                  loading
                    ? `${t('loading')}...`
                    : t(isFirstGuest ? 'register' : 'add_guest')
                }
                disabled={loading}
              />
            </Link>
          </BottomButtonWrapper>
        )}
      </Content>
    </Modal>
  );
}

export {PayingGuestSelectionModal};
