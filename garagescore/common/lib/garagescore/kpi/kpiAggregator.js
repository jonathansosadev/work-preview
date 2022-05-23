/* In this file we'll find the aggregates that run in order to compute the KPIs */

const aggregateErepKpi = require('./kpiAggregatorErep');
const aggregateSatisfactionKpi = require('./kpiAggregatorSatisfaction');
const aggregateAutomationKpi = require('./kpiAggregatorAutomation');
const aggregateLeadsKpi = require('./kpiAggregatorLeads');
const aggregateContactsKpi = require('./kpiAggregatorContacts');
const aggregateUnsatisfiedKpi = require('./kpiAggregatorUnsatisfied');
const aggregateConversionKpi = require('./kpiAggregatorConversion');

module.exports = {
  aggregateLeadsKpi,
  aggregateUnsatisfiedKpi,
  aggregateConversionKpi,
  aggregateErepKpi,
  aggregateSatisfactionKpi,
  aggregateAutomationKpi,
  aggregateContactsKpi,
};
