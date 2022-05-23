import React from 'react';
import * as Sentry from '@sentry/react';
import {useLocation, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useUser} from '../../../context/user';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {useErrorModal, useModalControls} from '../../../utils/hooks';
import {UPSELLING_LINKS} from '../../../utils/links';
import {Offer} from '../../../utils/upselling/types';
import GridItems from '../GridItems';
import GridSingleItem from '../GridSingleItem';
import CreateOfferButton from '../CreateOfferButton';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

type Params = {
  id?: string;
};

type OffersItemsProps = {
  offers: Offer[];
  getIsOfferActive: (offer: Offer) => boolean;
  getIsOfferDeletable?: (offer: Offer) => boolean;
  offerUpdateMutation: ({
    nextIsActive,
    offer,
  }: {
    nextIsActive: boolean;
    offer: Offer;
  }) => void;
  deleteOfferMutation?: ({id}: {id: string}) => void;
  deletionModal?: {
    title?: string;
    text?: string;
    deleteButtonLabel?: string;
  };
  className?: string;
};

function OffersItems({
  offers,
  deleteOfferMutation,
  offerUpdateMutation,
  deletionModal,
  getIsOfferActive,
  getIsOfferDeletable,
  className,
}: OffersItemsProps) {
  const {t} = useTranslation();
  const user = useUser();
  const location = useLocation();
  const params = useParams<Params>();
  const {goThroughConfirm} = useConfirmLeaveModal();
  const {ErrorModal, displayError} = useErrorModal();
  const [offerDeletionId, setOfferDeletionId] = React.useState('');
  const {
    isOpen: isDeletionModalOpen,
    closeModal: closeDeletionModal,
    openModal: openDeletionModal,
  } = useModalControls();

  const scrollContainer = React.useRef<HTMLDivElement>(null);

  const handleDeletionModalClose = () => {
    setOfferDeletionId('');
    closeDeletionModal();
  };

  const handleDeleteButtonClick = (id: string) => {
    setOfferDeletionId(id);
    openDeletionModal();
  };

  const deleteOffer = () => {
    if (!offerDeletionId) {
      Sentry.captureMessage(`Unable to get deal deletion id of user: ${user?.id}`);
      displayError('Unable to get deal deletion id.');
      return;
    }

    deleteOfferMutation?.({id: offerDeletionId});
  };

  const deleteOfferAndCloseDeletionModal = () => {
    deleteOffer();
    handleDeletionModalClose();
  };

  const goThroughConfirmationModals = (link: string) => {
    const housingId = params.id;

    if (housingId) {
      const state = {
        housingURL: location.pathname,
      };

      goThroughConfirm(link, state);
    } else {
      goThroughConfirm(link);
    }
  };

  const goToOffer = (id: string) => {
    const link = `${UPSELLING_LINKS.offersDetails}/${id}`;
    goThroughConfirmationModals(link);
  };

  const handleOfferCreationLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    path: string,
  ) => {
    event.preventDefault();
    goThroughConfirmationModals(path);
  };

  const scrollCreateOfferButtonIntoView = () => {
    const container = scrollContainer.current;

    if (!container) {
      return;
    }

    const isScrollbarVisible = container.scrollHeight > container.clientHeight;

    if (isScrollbarVisible) {
      container.scrollTo({
        top: container.scrollHeight,
      });
    }
  };

  return (
    <>
      <ErrorModal />
      <DeleteConfirmationModal
        isOpen={isDeletionModalOpen}
        title={deletionModal?.title || t('delete_deal_question')}
        text={deletionModal?.text || t('all_information_will_be_deleted')}
        onDelete={deleteOfferAndCloseDeletionModal}
        onClose={handleDeletionModalClose}
        deleteButtonLabel={deletionModal?.deleteButtonLabel}
      />
      <GridItems
        className={className}
        ref={scrollContainer}
        placeholder={
          <div onClick={scrollCreateOfferButtonIntoView}>
            <CreateOfferButton
              position="bottom"
              onLinkClick={handleOfferCreationLinkClick}
            />
          </div>
        }
      >
        {offers?.map((offer) => {
          const isActive = getIsOfferActive(offer);
          const isDeletable = getIsOfferDeletable ? getIsOfferDeletable(offer) : true;

          return (
            <GridSingleItem
              key={offer.id}
              active={isActive}
              name={offer.title}
              onClick={() => {
                goToOffer(offer.id);
              }}
              onDelete={
                isDeletable && deleteOfferMutation
                  ? (event) => {
                      event.stopPropagation();
                      handleDeleteButtonClick(offer.id);
                    }
                  : undefined
              }
              onActiveSwitch={(active, event) => {
                event.stopPropagation();
                offerUpdateMutation({offer, nextIsActive: active});
              }}
            />
          );
        })}
      </GridItems>
    </>
  );
}

export {OffersItems};
