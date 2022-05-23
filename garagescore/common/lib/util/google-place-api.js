/**
 * Google place API
 */
const app = require('../../../server/server');
const config = require('config');
const axios = require('axios');
const { SIMON, log } = require('./log.js');
const { getDeepFieldValue } = require('./object.js');

if (!config.has('google.backendApiKey') || !config.get('google.backendApiKey')) {
  log.warning(SIMON, `google.backendApiKey is not defined`);
}

/**
 * IMPORTANT: To understand how we get values from google respond, see:
 * ./google-answer-example.json
 */
const parser = {
  id: ({ place_id }) => place_id,
  latitude: ({ geometry }) => geometry.location.lat,
  longitude: ({ geometry }) => geometry.location.lng,
  phone: ({ formatted_phone_number }) => formatted_phone_number,
  rating: ({ rating }) => rating,
  reviewCount: ({ reviews }) => (reviews && reviews.length) || 0,
  website: ({ website }) => website,
  url: ({ url }) => url,
  city: ({ address_components }) =>
    address_components.find((c) => ['locality', 'postal_town'].includes(c.types[0])).long_name,
  postalCode: ({ address_components }) => address_components.find((c) => c.types[0] === 'postal_code').long_name,
  region: ({ address_components }) =>
    address_components.find((c) => c.types[0] === 'administrative_area_level_1').long_name,
  subRegion: ({ address_components }) =>
    address_components.find((c) => c.types[0] === 'administrative_area_level_2').long_name,
  streetAddress: ({ address_components, formatted_address }) => {
    const streetNumber = address_components.find((c) => c.types[0] === 'street_number');
    const premise = address_components.find((c) => c.types[0] === 'premise');
    const route = address_components.find((c) => c.types[0] === 'route');
    const streetAddress = [premise, streetNumber, route]
      .map((e) => e && e.long_name)
      .filter((e) => e)
      .join(' ');
    return (streetAddress || formatted_address.replace(/,.*/, '')).trim();
  },
  businessStatus: ({ business_status }) => business_status, // OPERATIONAL, CLOSED_TEMPORARILY et CLOSED_PERMANENTLY
  openingHours: ({ opening_hours }) => {
    if (!Array.isArray(opening_hours.periods) || !opening_hours.periods.length)
      throw new Error('Periods of opening_hours not found');
    return opening_hours.periods;
  },
  lastUpdate: () => new Date(),
};

// Get google place details
const getPlaceDetails = async ({ googlePlaceId }) => {
  const result = {};
  if (!googlePlaceId) throw new Error(`googlePlaceId not given`);
  const baseUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
  const place = await axios.get(`${baseUrl}?placeid=${googlePlaceId}&key=${config.get('google.backendApiKey')}`);
  const details = getDeepFieldValue(place, 'data.result');
  if (!details && place && place.data)
    throw new Error(`getPlaceDetails Err: ${googlePlaceId} ${place.data.status} :: ${place.data.error_message}`);
  else if (!details) throw new Error(`getPlaceDetails Err: ${googlePlaceId} no details`);
  for (const [field, func] of Object.entries(parser)) {
    try {
      result[field] = func(details);
    } catch (e) {
      if (field === 'postalCode') throw new Error(`Empty postalCode, wrong googlePlaceId ?`);
    }
    if (typeof result[field] === 'undefined') result[field] = null;
  }
  return result;
};

const _sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Update googlePlaceHistory one time per month
const _handleGooglePlaceHistory = (garage) => {
  const $push = {};
  if (new Date().getDate() > 7) return;
  if (!garage.googlePlaceHistory) garage.googlePlaceHistory = [];
  const { googlePlace } = garage;
  const { rating, reviewCount } = googlePlace;
  const googlePlaceHistory = { rating, reviewCount, createdAt: new Date() };
  garage.googlePlaceHistory.push(googlePlaceHistory);
  $push.googlePlaceHistory = googlePlaceHistory;
  return $push;
};

const handleGooglePlaceUpdate = async (garage, placeDetails) => {
  const mongo = app.models.Garage.getMongoConnector();
  const updates = {};
  const $set = mergePlaceDetailsWithGarage(garage, placeDetails || (await getPlaceDetails(garage)));
  const $push = _handleGooglePlaceHistory(garage);
  if ($set) updates.$set = $set;
  if ($push) updates.$push = $push;
  return await mongo.updateOne({ _id: garage._id }, updates);
};

// Synchronize garages given with google place details
const synchronizeGarages = async (garages) => {
  let updatedGaragesCount = 0;

  if (!Array.isArray(garages) || !garages.length) {
    log.info(SIMON, 'SynchronizeGarages FAILED: garages is not a array or is empty...');
    return null;
  }
  log.info(SIMON, 'Starting to synchronize all given garages with google Place...');
  for (const garage of garages) {
    try {
      await handleGooglePlaceUpdate(garage);
      updatedGaragesCount++;
      log.info(
        SIMON,
        `SUCCESS for garage ${garage._id && garage._id.toString()} - ${updatedGaragesCount}/${
          garages.length
        } updated...`
      );
      await _sleep(100); // Give googlePlaceApi some air or he will give a OVER_QUERY_LIMIT
    } catch (e) {
      let errorMessage = e.message;
      while (errorMessage.includes('OVER_QUERY_LIMIT')) {
        log.info(SIMON, `Google send a OVER_QUERY_LIMIT... let's try again in 5s`);
        await _sleep(5000); // wait and try again till it works
        errorMessage = '';
        try {
          await handleGooglePlaceUpdate(garage);
          updatedGaragesCount++;
          log.info(SIMON, `RETRY SUCCESS ! ${updatedGaragesCount}/${garages.length} updated...`);
        } catch (e) {
          errorMessage = e.message;
        }
      }
      if (errorMessage) log.error(SIMON, `SynchronizeGarages error: ${errorMessage}`);
    }
  }
  log.info(SIMON, `Synchronize garages with google place done ! ${updatedGaragesCount} updated`);
  return garages; // updatedGarages
};

/**
 * Merge placeDetails with the garage. It will not overwrite modified values from /backoffice/garages
 * @param garage
 * @param placeDetails
 * @param garageToUpdate
 */
const mergePlaceDetailsWithGarage = (garage, placeDetails, garageToUpdate = garage) => {
  // Prepare a $set object to update the garage if needed
  const $set = {};
  if (!garage.googlePlace) garage.googlePlace = {};
  // Synchronize fields from garage.googlePlace and garage for /backoffice/garages
  for (const field of ['streetAddress', 'postalCode', 'city', 'region', 'subRegion', 'phone']) {
    if (
      typeof garage[field] === 'undefined' ||
      (!garage[field] && !garage.googlePlace[field]) ||
      (garage[field] === garage.googlePlace[field] && garage[field] !== placeDetails[field])
    ) {
      garageToUpdate[field] = placeDetails[field];
      $set[field] = placeDetails[field];
    }
  }
  garageToUpdate.googlePlace = placeDetails;
  $set.googlePlace = placeDetails;
  return $set;
};

module.exports = {
  getPlaceDetails,
  synchronizeGarages,
  mergePlaceDetailsWithGarage,
  handleGooglePlaceUpdate,
};
