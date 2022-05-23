import {Offer} from './types';

function getSummaryPrices(offer: Offer) {
  return offer.items.reduce((sum, itemPrice) => sum + Number(itemPrice?.price || 0), 0);
}

export {getSummaryPrices};
