import React from 'react';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {Guest, GuestGroup} from '../../../utils/types';
import {useModalControls} from '../../../utils/hooks';
import {downloadFromLink} from '../../../utils/common';
import viewIcon from '../../../assets/view-icon.svg';
import downloadIcon from '../../../assets/download-icon.svg';
import Section from '../Section';
import Modal from '../Modal';
import ModalBigCloseButton from '../ModalBigCloseButton';
import {
  Table,
  HeaderCell,
  NameCell,
  IconButton,
  DownloadButton,
  GuestImage,
  ModalContent,
  ImageName,
  ButtonTD,
  GuestModalContent,
} from './styled';

function getIsGuestWithPhoto(guest: Guest) {
  const isBiomatchCompleted = guest.biomatch_doc && guest.biomatch_selfie;
  const hasDocumentImage =
    guest.document?.back_side_scan || guest.document?.front_side_scan;

  return isBiomatchCompleted || hasDocumentImage;
}

function getGuestsWithPhotos(guestGroup?: GuestGroup) {
  const groupMembers = guestGroup?.members;

  if (!groupMembers?.length) {
    return [];
  }
  return groupMembers.filter((guest) => getIsGuestWithPhoto(guest));
}

function getGuestPhotosSummary(guestGroup?: GuestGroup) {
  const groupMembers = guestGroup?.members;
  const result = {
    hasAnyBackSide: false,
    hasAnyFrontSide: false,
    hasAnySelfie: false,
    hasAnyDoc: false,
  };

  if (!groupMembers?.length) {
    return result;
  }

  groupMembers.forEach((guest) => {
    if (guest.document?.back_side_scan) {
      result.hasAnyBackSide = true;
    }

    if (guest.document?.front_side_scan) {
      result.hasAnyFrontSide = true;
    }

    if (guest.biomatch_selfie) {
      result.hasAnySelfie = true;
    }

    if (guest.biomatch_doc) {
      result.hasAnyDoc = true;
    }
  });

  return result;
}

type ReservationPhotosSectionProps = {
  guestGroup?: GuestGroup;
};

function ReservationPhotosSection({guestGroup}: ReservationPhotosSectionProps) {
  const {t} = useTranslation();
  const {isOpen, openModal, closeModal} = useModalControls();
  const [activeGuest, setActiveGuest] = React.useState<Guest | null>(null);
  const biomatchGuests = React.useMemo(() => {
    return getGuestsWithPhotos(guestGroup);
  }, [guestGroup]);
  const photosSummary = React.useMemo(() => {
    return getGuestPhotosSummary(guestGroup);
  }, [guestGroup]);

  const viewPhotos = (guest: Guest) => {
    openModal();
    setActiveGuest(guest);
  };

  const closePhotos = () => {
    closeModal();
    setActiveGuest(null);
  };

  const downloadImage = (downloadLink?: string) => {
    if (downloadLink) {
      downloadFromLink(downloadLink);
    } else {
      toast.warn('Photo download download link is missing');
    }
  };

  if (!biomatchGuests.length) {
    return null;
  }

  return (
    <Section title={t('photos')}>
      <Table>
        <tbody>
          <tr>
            <HeaderCell />
            <HeaderCell />
            {photosSummary.hasAnyDoc && <HeaderCell>ID</HeaderCell>}
            {photosSummary.hasAnySelfie && <HeaderCell>{t('selfie')}</HeaderCell>}
            {photosSummary.hasAnyFrontSide && <HeaderCell>{t('frontside')}</HeaderCell>}
            {photosSummary.hasAnyBackSide && <HeaderCell>{t('backside')}</HeaderCell>}
          </tr>
          {biomatchGuests.map((guest) => {
            const biomatchDocLink = guest?.biomatch_doc_download;
            const selfieLink = guest?.biomatch_selfie_download;
            const frontSideScanLink = guest.document?.front_side_scan_download;
            const backSideScanLink = guest.document?.back_side_scan_download;

            return (
              <tr key={guest.id}>
                <NameCell>{guest.full_name}</NameCell>
                <td>
                  <IconButton type="button" onClick={() => viewPhotos(guest)}>
                    <img src={viewIcon} alt="Eye" />
                  </IconButton>
                </td>
                {photosSummary.hasAnyDoc && (
                  <ButtonTD>
                    {biomatchDocLink && (
                      <IconButton
                        onClick={() => downloadImage(biomatchDocLink)}
                        type="button"
                      >
                        <img src={downloadIcon} alt="Download" />
                      </IconButton>
                    )}
                  </ButtonTD>
                )}
                {photosSummary.hasAnySelfie && (
                  <ButtonTD>
                    {selfieLink && (
                      <IconButton onClick={() => downloadImage(selfieLink)} type="button">
                        <img src={downloadIcon} alt="Download" />
                      </IconButton>
                    )}
                  </ButtonTD>
                )}
                {photosSummary.hasAnyFrontSide && (
                  <ButtonTD>
                    {frontSideScanLink && (
                      <IconButton
                        onClick={() => downloadImage(frontSideScanLink)}
                        type="button"
                      >
                        <img src={downloadIcon} alt="Download" />
                      </IconButton>
                    )}
                  </ButtonTD>
                )}
                {photosSummary.hasAnyBackSide && (
                  <ButtonTD>
                    {backSideScanLink && (
                      <IconButton
                        onClick={() => downloadImage(backSideScanLink)}
                        type="button"
                      >
                        <img src={downloadIcon} alt="Download" />
                      </IconButton>
                    )}
                  </ButtonTD>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Modal closeOnDocumentClick closeOnEscape open={isOpen} onClose={closePhotos}>
        <ModalContent>
          <ModalBigCloseButton onClick={closePhotos} />
          {activeGuest?.biomatch_doc && (
            <GuestModalContent>
              <GuestImage url={activeGuest.biomatch_doc} />
              <ImageName>{t('photo_from_id_passport')}</ImageName>
              <DownloadButton
                type="button"
                onClick={() => downloadImage(activeGuest.biomatch_doc_download!)}
              >
                ({t('download_id_photo')})
              </DownloadButton>
            </GuestModalContent>
          )}
          {activeGuest?.biomatch_selfie && (
            <GuestModalContent>
              <GuestImage url={activeGuest.biomatch_selfie} />
              <ImageName>{t('photo_from_selfie')}</ImageName>
              <DownloadButton
                type="button"
                onClick={() => downloadImage(activeGuest.biomatch_selfie_download!)}
              >
                ({t('download_selfie')})
              </DownloadButton>
            </GuestModalContent>
          )}
          {activeGuest?.document?.front_side_scan && (
            <>
              <GuestModalContent>
                <GuestImage url={activeGuest.document.front_side_scan} />
                <ImageName>{t('frontside')}</ImageName>
                <DownloadButton
                  type="button"
                  onClick={() =>
                    downloadImage(activeGuest.document?.front_side_scan_download!)
                  }
                >
                  ({t('download_frontside')})
                </DownloadButton>
              </GuestModalContent>
            </>
          )}
          {activeGuest?.document?.back_side_scan && (
            <GuestModalContent>
              <GuestImage url={activeGuest.document.back_side_scan} />
              <ImageName>{t('backside')}</ImageName>
              <DownloadButton
                type="button"
                onClick={() =>
                  downloadImage(activeGuest.document.back_side_scan_download!)
                }
              >
                ({t('download_backside')})
              </DownloadButton>
            </GuestModalContent>
          )}
        </ModalContent>
      </Modal>
    </Section>
  );
}

export {ReservationPhotosSection};
