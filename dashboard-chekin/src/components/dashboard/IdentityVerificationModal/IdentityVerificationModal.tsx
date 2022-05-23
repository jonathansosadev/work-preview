import React from 'react';
import {useTranslation} from 'react-i18next';
import {UseMutateFunction} from 'react-query';
import {getDocumentPhotos} from '../../../utils/guest';
import {Guest, LightReservation} from '../../../utils/types';
import greenCheck from '../../../assets/check-green.svg';
import Modal from '../Modal';
import Tooltip from '../Tooltip';
import Loader from '../../common/Loader';
import GuestVerificationImage from './GuestVerificationImage';
import ResendEmailButton from '../GuestInformationSection/ResendEmailButton';
import {RowSuccessIcon} from '../GuestInformationSection/styled';
import {
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalText,
  ButtonApprove,
  ModalFooter,
  ApprovedWord,
  GroupButtons,
} from './styled';

type IdentityVerificationModalProps = {
  isOpen: boolean;
  guest: Guest;
  reservation: LightReservation;
  isDocumentAndSelfie: boolean;
  isOnlyOfficialDocument: boolean;
  timeoutApproveRef: React.RefObject<ReturnType<typeof setTimeout> | undefined>;
  onClickApprove: UseMutateFunction<unknown, Error>;
  isLoading: boolean;
  isSuccessApproved: boolean;
  onClose: () => void;
};

function IdentityVerificationModal({
  isOpen,
  onClose,
  guest,
  onClickApprove,
  isLoading,
  isSuccessApproved,
  isDocumentAndSelfie,
  isOnlyOfficialDocument,
  timeoutApproveRef,
  reservation,
}: IdentityVerificationModalProps) {
  const {t} = useTranslation();
  const isBiomatchPassed = isDocumentAndSelfie && guest.biomatch_passed;
  const isDocumentPassed = isOnlyOfficialDocument && guest.document_passed;
  const isGuestApproved = isBiomatchPassed || isDocumentPassed || isSuccessApproved;
  const isVisibleButton = !isGuestApproved && !isLoading && !isSuccessApproved;

  const getGuestImages = React.useCallback(() => {
    const documentPhotos = getDocumentPhotos(guest);
    if (!isDocumentAndSelfie && documentPhotos) {
      return [
        {...documentPhotos?.frontSide, label: t('document_photo_front_side')},
        {...documentPhotos?.backSide, label: t('document_photo_back_side')},
      ];
    }
    return [
      {
        src: guest?.biomatch_doc,
        srcDownload: guest?.biomatch_doc_download,
        label: t('document_photo'),
      },
      {
        src: guest?.biomatch_selfie,
        srcDownload: guest?.biomatch_selfie_download,
        label: t('selfie_photo'),
      },
    ];
  }, [guest, isDocumentAndSelfie, t]);

  React.useEffect(() => {
    const timeoutApprove = timeoutApproveRef.current;
    return () => {
      if (timeoutApprove) {
        clearTimeout(timeoutApprove);
      }
    };
  }, [timeoutApproveRef]);

  return (
    <Modal
      open={isOpen}
      closeOnDocumentClick
      closeOnEscape
      onClose={onClose}
      withCloseButton
    >
      <ModalHeader isDocumentAndSelfie={isDocumentAndSelfie}>
        <ModalTitle>
          {isDocumentAndSelfie ? t('approve_manually') : t('document_verification')}
        </ModalTitle>
        {!isGuestApproved ? <ModalText>{t('photos_match_text')}</ModalText> : ''}
      </ModalHeader>
      <ModalContent>
        {getGuestImages().map((img) => (
          <GuestVerificationImage image={img} isApproved={isGuestApproved} />
        ))}
      </ModalContent>
      <ModalFooter>
        {isLoading && <Loader width={60} />}
        {isSuccessApproved && (
          <ApprovedWord>
            Approved!
            <RowSuccessIcon src={greenCheck} alt="Approved" />
          </ApprovedWord>
        )}
        {isVisibleButton && (
          <>
            <ButtonApprove
              disabled={isLoading}
              onClick={() => onClickApprove()}
              label={t('approve_manually')}
            />
            <GroupButtons>
              <ResendEmailButton
                reservation={reservation}
                label={t('resend_identity_verification')}
              />
              <Tooltip content={t('resend_identity_verification_tooltip')} />
            </GroupButtons>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}

export {IdentityVerificationModal};
