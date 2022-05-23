import {Deal, Offer, Supplier, UpsellingBannersInfo} from '../utils/upselling/types';
import {queryFetcher} from './index';
import {OfferPicture} from '../components/dashboard/PictureLibraryModal/PictureLibraryModal';
import {UserFeedbackInfo} from '../components/dashboard/Banner/types';

const ENDPOINTS = {
  offers: (params = '') => `upselling/offers/?${params}`,
  offersWithoutDeals: (params = '') => `upselling/offers/without-deals?${params}`,
  oneOffer: (id: string, params = '') => `upselling/offers/${id}/?${params}`,
  suppliers: (params = '') => `upselling/suppliers/${params}`,
  oneSupplier: (id: string, params = '') => `upselling/suppliers/${id}/?${params}`,
  waivoSupplier: () => `upselling/suppliers/waivo-supplier/`,
  offerImages: (params = '') => `upselling/offer-images/?${params}`,
  oneOfferImage: (id: string, params = '') => `upselling/offer-images/${id}/?${params}`,
  dealsReports: (params = '') => `upselling/deals/report-payments/?${params}`,
  oneDealDate: (params = '') => `upselling/deals/first-deal-date/?${params}`,
  unassignHousing: (offerId: string, params = '') =>
    `upselling/offers/${offerId}/unassign-housing/?${params}`,
  deals: (params = '') => `upselling/deals/?${params}`,
  oneDeal: (id: string, params = '') => `upselling/deals/${id}/?${params}`,
  userFeedbackInfo: (id = '') => `user-upselling-feedback-info/${id}`,
  upsellingBannersInfo: (id = '') => `user-upselling-banners-info/${id}`,
};

function supplierMutation<T extends {id?: string}>(payload: T) {
  return queryFetcher<Supplier>(
    payload?.id ? ENDPOINTS.oneSupplier(payload.id) : ENDPOINTS.suppliers(),
    {
      method: payload?.id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    },
  );
}

function deleteSupplierMutation(id: string) {
  return queryFetcher<undefined>(ENDPOINTS.oneSupplier(id), {
    method: 'DELETE',
  });
}

function offerMutation(payload: any, id?: string) {
  return queryFetcher<Offer>(id ? ENDPOINTS.oneOffer(id) : ENDPOINTS.offers(), {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  });
}

function deleteOfferMutation(id: string) {
  return queryFetcher<undefined>(ENDPOINTS.oneOffer(id), {
    method: 'DELETE',
  });
}

function updateOfferMutation<T extends {id: string}>(payload: T) {
  return queryFetcher<Offer>(ENDPOINTS.oneOffer(payload.id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function offerImageMutation(payload: any) {
  return queryFetcher<OfferPicture>(
    payload?.id ? ENDPOINTS.oneOfferImage(payload.id) : ENDPOINTS.offerImages(),
    {
      method: payload?.id ? 'PATCH' : 'POST',
      body: JSON.stringify(payload?.id ? {...payload, id: undefined} : payload),
    },
  );
}

function deleteOfferImageMutation(id: string) {
  return queryFetcher<undefined>(ENDPOINTS.oneOfferImage(id), {
    method: 'DELETE',
  });
}

function unassignHousingMutation(offerId: string, housingId: string) {
  return queryFetcher<undefined>(ENDPOINTS.unassignHousing(offerId), {
    method: 'POST',
    body: JSON.stringify({housing_id: housingId}),
  });
}

function updateDealMutation(payload: Partial<Omit<Deal, 'id'>> & Pick<Deal, 'id'>) {
  return queryFetcher<Deal>(ENDPOINTS.oneDeal(payload.id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function updateUserFeedbackInfoMutation({
  id,
  ...payload
}: Partial<Omit<UserFeedbackInfo, 'id'>> & Pick<UserFeedbackInfo, 'id'>) {
  return queryFetcher(ENDPOINTS.userFeedbackInfo(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

function createUpsellingBannersInfoMutation(
  payload: Partial<Omit<UpsellingBannersInfo, 'id'>>,
) {
  return queryFetcher(ENDPOINTS.upsellingBannersInfo(), {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function updateUpsellingBannersInfoMutation({
  id,
  ...payload
}: Partial<Omit<UpsellingBannersInfo, 'id'>> & Pick<UpsellingBannersInfo, 'id'>) {
  return queryFetcher(ENDPOINTS.upsellingBannersInfo(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export {
  ENDPOINTS,
  offerImageMutation,
  supplierMutation,
  deleteSupplierMutation,
  offerMutation,
  deleteOfferMutation,
  updateOfferMutation,
  deleteOfferImageMutation,
  unassignHousingMutation,
  updateDealMutation,
  updateUserFeedbackInfoMutation,
  createUpsellingBannersInfoMutation,
  updateUpsellingBannersInfoMutation,
};
