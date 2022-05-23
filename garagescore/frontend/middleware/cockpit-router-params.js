import { isArray } from "lodash";
import GarageTypes from "~/utils/models/garage.type";
import { getGaragesIdsFromTags } from '../util/filters.js'//frontend/util/filters.js

export default async ({ route, store }) => {

  if (route.query) {
    // The url can contain information about the origin (browser/pwa)
    if (route.query.origin) {
      store.commit('cockpit/setCurrentOrigin', route.query.origin);
    }

    if (route.query.cockpitType) {
      store.commit('cockpit/setCurrentCockpitType', route.query.cockpitType);
    }

    if (route.query.dataTypeId) {
      store.commit('cockpit/setCurrentDataTypeId', route.query.dataTypeId);
    }
    if (route.query.leadSaleType) {
      store.commit('cockpit/setCurrentLeadSaleType', route.query.leadSaleType);
    }

    if (route.query.automationCampaignType) {
      store.commit('cockpit/setCurrentAutomationCampaignType', route.query.automationCampaignType);
    }

    if (route.query.periodId) {
      store.commit('cockpit/setCurrentPeriodId', route.query.periodId);
    }

    if (route.query.dms) {
      store.commit('cockpit/setCurrentDms', {
        frontDeskUserName: route.query.dms,
        garageId: Array.isArray(route.query.garageIds)? route.query.garageIds[0] : route.query.garageIds
      });
    }

    if (route.query.user) {
      store.commit('cockpit/setCurrentUser', route.query.user);
    }
    if (route.query?.garageIds?.length) {
      const tempGarageIds = Array.isArray(route.query.garageIds)
        ? route.query.garageIds
        : [route.query.garageIds];
      store.commit('cockpit/setCurrentGarageId', tempGarageIds);
      const currentGarage = store.state.cockpit.availableGarages.find(
        g => g.id === route.query.garageIds
      );

      if (currentGarage) {
        store.commit(
          'cockpit/setCurrentCockpitType',
          GarageTypes.getCockpitType(currentGarage.type)
        );
      }
    }
  }
};
