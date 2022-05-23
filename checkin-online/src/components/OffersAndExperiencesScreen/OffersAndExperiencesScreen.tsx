import React from 'react';
import {useTranslation} from 'react-i18next';
import {useParams, useHistory, useLocation} from 'react-router-dom';
import useSWR from 'swr';
import api, {getURL} from '../../api';
import {Offer} from '../../utils/upselling/types';
import {OFFER_CATEGORIES, getSummaryPrices} from '../../utils/upselling';
import {useErrorModal, useIsMounted, useModalControls} from '../../utils/hooks';
import {usePaymentSettings} from '../../hooks/usePaymentSettings';
import {useReservation} from '../../context/reservation';
import {useCartDeals} from './useCartDeals';
import {deleteQueryParam, getURLSearchParam} from '../../utils/common';
import {setStoredGuestId} from '../../utils/guests';
import {RESERVATION_ID_SEARCH_PARAM_NAME} from '../../context/storedURLParams';
import presentIcon from '../../assets/present.svg';
import Loader from '../Loader';
import OfferTile, {OFFER_LABELS} from '../OfferTile';
import Header from '../Header';
import ContentTile, {Footer} from '../ContentTile';
import Modal from '../Modal';
import Button from '../Button';
import BookOfferFormModal from '../BookOfferFormModal';
import {
  HeaderContainer,
  HeaderTitle,
  OffersGrid,
  LoaderWrapper,
  RequestOfferSuccessModalWrapper,
  StyledTabLinks,
} from './styled';

export const OFFER_SUCCESSFULLY_REQUESTED_URL_PARAM = 'request-success';

type filters =
  | OFFER_CATEGORIES.checkInCheckOut
  | OFFER_CATEGORIES.transportation
  | OFFER_CATEGORIES.other
  | undefined;
const urlFilters = {
  all: `/deals-list`,
  checkInCheckOut: `/deals-list/${OFFER_CATEGORIES.checkInCheckOut}`,
  transportation: `/deals-list/${OFFER_CATEGORIES.transportation}`,
  other: `/deals-list/${OFFER_CATEGORIES.other}`,
};
const guestIdURLParam = 'guest-id';

const allTabLinks = [
  {
    to: urlFilters.all,
    name: 'all',
    value: '',
    exact: true,
  },
  {
    to: urlFilters.checkInCheckOut,
    name: 'early_check_in_late_check_out',
    value: 'CHECK_IN_CHECK_OUT',
  },
  {
    to: urlFilters.transportation,
    name: 'transportation',
    value: 'TRANSPORTATION',
  },
  {
    to: urlFilters.other,
    name: 'other',
    value: 'OTHER',
  },
];

function fetchOffersIfCanFetch(housingId: string | undefined, filter: filters) {
  if (!housingId) {
    return null;
  }

  return getURL(
    api.upselling.ENDPOINTS.offers(
      `housing_id=${housingId}&category=${filter || ''}&is_active=true`,
    ),
  );
}

type Params = {
  filter: filters;
};

function OffersAndExperiencesScreen() {
  const {t} = useTranslation();
  const params = useParams<Params>();
  const history = useHistory();
  const location = useLocation();
  const isMounted = useIsMounted();
  const {data: reservation} = useReservation();
  const {ErrorModal, displayError} = useErrorModal();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();
  const {
    isOpen: isOfferSuccessfullyRequestedModalOpen,
    closeModal: closeIsOfferSuccessfullyRequestedModal,
    openModal: openIsOfferSuccessfullyRequestedModal,
  } = useModalControls();
  const {
    isOpen: isBookOfferFormModalOpen,
    closeModal: closeBookOfferFormModal,
    openModal: openBookOfferFormModal,
  } = useModalControls();
  const {
    createCartDeals,
    isCreatingCartDeals,
    storedCartDeals,
    goNextAfterUpselling,
  } = useCartDeals({
    onError: displayError,
  });
  const [bookingOfferId, setBookingOfferId] = React.useState('');
  const [isSkipDealsShown, setIsSkipDealsShown] = React.useState(false);

  const housingId = reservation?.housing?.id;
  const filter = params?.filter as filters;
  const {data: offers, isValidating: isLoadingOffers} = useSWR<Offer[]>(
    fetchOffersIfCanFetch(housingId, filter),
    {
      onError: error => {
        if (isMounted.current) {
          displayError(error);
        }
      },
    },
  );

  const hasCartDeals = Boolean(Object.keys(storedCartDeals).length);

  const tabLinksWithOffers = [
    allTabLinks[0],
    ...allTabLinks
      .slice(1)
      .filter(link => offers?.some(offer => offer.category === link.value)),
  ];

  React.useEffect(
    function checkForURLGuestId() {
      const guestId = getURLSearchParam(guestIdURLParam, location.search);
      const reservationIdFromUrl = getURLSearchParam(
        RESERVATION_ID_SEARCH_PARAM_NAME,
        location.search,
      );
      setIsSkipDealsShown(!Boolean(reservationIdFromUrl));

      if (guestId) {
        setStoredGuestId(guestId);
      }
    },
    [location.search],
  );

  React.useEffect(
    function checkIsNeedToOpenIsOfferSuccessfullyRequestedModal() {
      const isOfferSuccessfullyRequested = getURLSearchParam(
        OFFER_SUCCESSFULLY_REQUESTED_URL_PARAM,
        location.search,
      );

      if (isOfferSuccessfullyRequested) {
        openIsOfferSuccessfullyRequestedModal();
      }
    },
    [history, location.pathname, location.search, openIsOfferSuccessfullyRequestedModal],
  );

  const deleteQuerySearchParam = (name: string) => {
    const nextSearchParams = deleteQueryParam(name, location.search);
    history.replace({
      search: nextSearchParams,
    });
  };

  const handleIsOfferSuccessfullyRequestedModalClose = () => {
    deleteQuerySearchParam(OFFER_SUCCESSFULLY_REQUESTED_URL_PARAM);
    closeIsOfferSuccessfullyRequestedModal();
  };

  const goToOfferDetails = (id: string) => {
    history.push(`/deal/${id}`);
  };

  const handleBookOfferClick = (id: string) => {
    setBookingOfferId(id);
    openBookOfferFormModal();
  };

  const handleBookOfferFormModalClose = () => {
    setBookingOfferId('');
    closeBookOfferFormModal();
  };

  const handleBookOfferFormModalRequestOfferSuccess = () => {
    openIsOfferSuccessfullyRequestedModal();
    handleBookOfferFormModalClose();
  };

  const handleSubmit = async () => {
    if (hasCartDeals) {
      const isError = await createCartDeals();

      if (!isError) {
        goNextAfterUpselling(true);
      }

      return;
    }

    goNextAfterUpselling();
  };

  const isLoading = isCreatingCartDeals;

  return (
    <>
      <ErrorModal />
      {isBookOfferFormModalOpen && (
        <BookOfferFormModal
          offerId={bookingOfferId}
          onClose={handleBookOfferFormModalClose}
          onRequestOfferSuccess={handleBookOfferFormModalRequestOfferSuccess}
        />
      )}
      <RequestOfferSuccessModalWrapper>
        <Modal
          closeOnDocumentClick
          closeOnEscape
          open={isOfferSuccessfullyRequestedModalOpen}
          onClose={handleIsOfferSuccessfullyRequestedModalClose}
          title={t('requested_exclamation')}
          text={t('offer_requested_text')}
          iconProps={{
            src: presentIcon,
            alt: '',
          }}
        >
          <Button
            onClick={handleIsOfferSuccessfullyRequestedModalClose}
            label={t('ok')}
          />
        </Modal>
      </RequestOfferSuccessModalWrapper>
      <Header title={t('deals_and_experiences')} hideBackButton />
      <ContentTile
        footer={
          <Footer
            button={{
              text: t('next'),
              props: {
                disabled: isLoading,
                onClick: handleSubmit,
              },
            }}
            altButton={
              isSkipDealsShown
                ? {
                    text: isLoading ? '' : t('skip_deals'),
                    props: {
                      onClick: () => goNextAfterUpselling(),
                    },
                  }
                : undefined
            }
          />
        }
      >
        <HeaderContainer>
          <HeaderTitle />
          <StyledTabLinks links={tabLinksWithOffers} />
        </HeaderContainer>
        {!offers && isLoadingOffers ? (
          <LoaderWrapper>
            <Loader label={t('loading')} />
          </LoaderWrapper>
        ) : (
          <OffersGrid>
            {offers?.map((offer: Offer) => {
              const selectedLabel = storedCartDeals[offer.id] && OFFER_LABELS.selected;
              const label = selectedLabel || '';
              const price = getSummaryPrices(offer);

              return (
                <OfferTile
                  key={offer.id}
                  label={label}
                  title={offer.title}
                  currency={paymentSettingsCurrencyLabel}
                  background={offer.offer_image?.image}
                  highlight={offer.highlight}
                  price={price}
                  onClick={() => goToOfferDetails(offer.id)}
                  onBook={event => {
                    event.stopPropagation();
                    handleBookOfferClick(offer.id);
                  }}
                />
              );
            })}
          </OffersGrid>
        )}
      </ContentTile>
    </>
  );
}

export {OffersAndExperiencesScreen};
