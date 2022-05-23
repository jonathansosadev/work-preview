import React from 'react';
import {useOfferAndSupplier} from '../OffersAndExperiencesScreen';
import {useErrorModal} from '../../utils/hooks';
import {useTranslation} from 'react-i18next';
import Modal from '../Modal';
import BookOfferForm from '../BookOfferForm';
import Loader from '../Loader';
import {Content, Title, LoaderWrapper} from './styled';

type BookOfferFormModalProps = {
  offerId: string;
  onClose: () => void;
  onRequestOfferSuccess: () => void;
};

function BookOfferFormModal({
  offerId,
  onClose,
  onRequestOfferSuccess,
}: BookOfferFormModalProps) {
  const {t} = useTranslation();
  const {ErrorModal, displayError} = useErrorModal();
  const {offer, supplier, isLoadingOfferOrSupplier} = useOfferAndSupplier(offerId, {
    onError: displayError,
  });

  return (
    <>
      <ErrorModal />
      <Modal open closeOnDocumentClick closeOnEscape withCloseButton onClose={onClose}>
        <Content>
          {isLoadingOfferOrSupplier ? (
            <LoaderWrapper>
              <Loader label={t('loading')} />
            </LoaderWrapper>
          ) : (
            offer && (
              <>
                <Title>{offer.title}</Title>
                <BookOfferForm
                  offer={offer}
                  supplier={supplier}
                  onRequestOfferSuccess={onRequestOfferSuccess}
                  onBookAndKeepExploringSuccess={onClose}
                />
              </>
            )
          )}
        </Content>
      </Modal>
    </>
  );
}

export {BookOfferFormModal};
