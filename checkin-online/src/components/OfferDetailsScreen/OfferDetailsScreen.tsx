import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useParams, useHistory} from 'react-router-dom';
import {
  OFFER_SUCCESSFULLY_REQUESTED_URL_PARAM,
  useOfferAndSupplier,
} from '../OffersAndExperiencesScreen';
import {useErrorModal} from '../../utils/hooks';
import {OFFER_CATEGORIES} from '../../utils/upselling';
import Header from '../Header';
import ContentTile from '../ContentTile';
import Loader from '../Loader';
import RequestOfferForm from '../BookOfferForm';
import {
  Grid,
  OfferImage,
  OfferColumn,
  OfferDescription,
  OfferTitle,
  LoaderWrapper,
  TermsAndConditionsWrapper,
  BookOfferColumn,
} from './styled';

export const CATEGORIES_WITH_ADDRESS = [OFFER_CATEGORIES.other];

type Params = {
  id: string;
};

function OfferDetailsScreen() {
  const {t} = useTranslation();
  const params = useParams<Params>();
  const history = useHistory();
  const {ErrorModal, displayError} = useErrorModal();
  const offerId = params.id;

  const {offer, supplier, isLoadingOfferOrSupplier} = useOfferAndSupplier(offerId, {
    onError: displayError,
  });

  const handleBookOfferAndKeepExploringSuccess = () => {
    history.push('/deals-list');
  };

  const handleRequestOfferSuccess = () => {
    history.push(`/deals-list?${OFFER_SUCCESSFULLY_REQUESTED_URL_PARAM}=true`);
  };

  return (
    <>
      <ErrorModal />
      <Header
        title={t('deals_and_experiences')}
        onBack={() => history.push('/deals-list')}
      />
      <ContentTile>
        <Grid>
          {isLoadingOfferOrSupplier ? (
            <LoaderWrapper>
              <Loader label={t('loading')} />
            </LoaderWrapper>
          ) : (
            <>
              <OfferColumn>
                <OfferImage backgroundURL={offer?.offer_image?.image || ''} />
                <OfferTitle>{offer?.title}</OfferTitle>
                <OfferDescription>{offer?.description}</OfferDescription>
              </OfferColumn>
              <BookOfferColumn>
                {offer && (
                  <RequestOfferForm
                    offer={offer}
                    supplier={supplier}
                    onRequestOfferSuccess={handleRequestOfferSuccess}
                    onBookAndKeepExploringSuccess={handleBookOfferAndKeepExploringSuccess}
                  />
                )}
                <TermsAndConditionsWrapper>
                  <Trans i18nKey={'deal_terms_and_conditions'}>
                    This deal is subject to{' '}
                    <a
                      href={t('terms_and_conditions_link')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms & Conditions
                    </a>
                  </Trans>
                </TermsAndConditionsWrapper>
              </BookOfferColumn>
            </>
          )}
        </Grid>
      </ContentTile>
    </>
  );
}

export {OfferDetailsScreen};
