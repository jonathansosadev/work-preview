const { KpiTypes } = require('../../../../../frontend/utils/enumV2');
const {
  aggregateUnsatisfiedKpi,
  aggregateLeadsKpi,
  aggregateConversionKpi,
  aggregateErepKpi,
  aggregateSatisfactionKpi,
  aggregateAutomationKpi,
  aggregateContactsKpi,
} = require('../../kpi/kpiAggregator');

const AggregateOutputsBaseModel = () => ({
  byGarage: {
    unsatisfied: [],
    leads: [],
    conversion: [],
    erep: [],
    satisfaction: [],
    automation: [],
    contacts: [],
  },
  byFollowedGarage: {
    leads: [],
  },
  byUser: {
    unsatisfied: [],
    leads: [],
  },
  byFrontDeskUser: {
    conversion: [],
    satisfaction: [],
    contacts: [],
  },
  bySource: {
    leads: [],
    conversion: [],
  },
  byAutomationCampaign: {
    automation: [],
  },
});

async function _calculateKpiForGivenPeriod(app, period, garageIds = []) {
  const AggregateOutputs = AggregateOutputsBaseModel();

  // byGarage
  AggregateOutputs.byGarage.unsatisfied = await aggregateUnsatisfiedKpi(app, { period, garageIds });
  AggregateOutputs.byGarage.leads = await aggregateLeadsKpi(app, { period, garageIds });
  AggregateOutputs.byGarage.conversion = await aggregateConversionKpi(app, { period, garageIds });
  AggregateOutputs.byGarage.erep = await aggregateErepKpi(app, { period, garageIds });
  AggregateOutputs.byGarage.satisfaction = await aggregateSatisfactionKpi(app, { period, garageIds });
  AggregateOutputs.byGarage.automation = await aggregateAutomationKpi(app, { period, garageIds });
  AggregateOutputs.byGarage.contacts = await aggregateContactsKpi(app, { period, garageIds });

  // byFollowedGarage
  AggregateOutputs.byFollowedGarage.leads = await aggregateLeadsKpi(app, {
    period,
    kpiType: KpiTypes.AGENT_GARAGE_KPI,
    garageIds,
  });

  // byUser
  AggregateOutputs.byUser.unsatisfied = await aggregateUnsatisfiedKpi(app, {
    period,
    kpiType: KpiTypes.USER_KPI,
    garageIds,
  });
  AggregateOutputs.byUser.leads = await aggregateLeadsKpi(app, { period, kpiType: KpiTypes.USER_KPI, garageIds });

  // byFrontDeskUser
  AggregateOutputs.byFrontDeskUser.conversion = await aggregateConversionKpi(app, {
    period,
    kpiType: KpiTypes.FRONT_DESK_USER_KPI,
    garageIds,
  });
  AggregateOutputs.byFrontDeskUser.satisfaction = await aggregateSatisfactionKpi(app, {
    period,
    kpiType: KpiTypes.FRONT_DESK_USER_KPI,
    garageIds,
  });
  AggregateOutputs.byFrontDeskUser.contacts = await aggregateContactsKpi(app, {
    period,
    kpiType: KpiTypes.FRONT_DESK_USER_KPI,
    garageIds,
  });

  // bySource
  AggregateOutputs.bySource.leads = await aggregateLeadsKpi(app, { period, kpiType: KpiTypes.SOURCE_KPI, garageIds });
  AggregateOutputs.bySource.conversion = await aggregateConversionKpi(app, {
    period,
    kpiType: KpiTypes.SOURCE_KPI,
    garageIds,
  });

  // byAutomationCampaign
  AggregateOutputs.byAutomationCampaign.automation = await aggregateAutomationKpi(app, {
    period,
    kpiType: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
    garageIds,
  });

  return AggregateOutputs;
}

module.exports = { _calculateKpiForGivenPeriod, AggregateOutputsBaseModel };
