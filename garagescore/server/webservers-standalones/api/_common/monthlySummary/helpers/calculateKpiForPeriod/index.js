const { fillConversionZeros } = require('../util');
const _aggregateKpiForLeads = require('./_aggregateKpiForLeads');
const _aggregateKpiForUnsatisfied = require('./_aggregateKpiForUnsatisfied');
const _aggregateKpiForSatisfaction = require('./_aggregateKpiForSatisfaction');
const _aggregateKpiForValidEmails = require('./_aggregateKpiForValidEmails');

module.exports = async (garages, period, dataType, userAccesses, garagesAccesses, kpiConnector) => {
  if (!garages || !Array.isArray(garages) || !garages.length) {
    return [];
  }
  /** Determining if we can get the main figure for each tab */
  const garagesForLeads = garagesAccesses.filter((g) => g.leads && g.leads.length);
  const isSubscribedSatisfaction = garagesAccesses.some((g) => g.satisfaction && g.satisfaction.length);
  const isSubscribedProblemResolution = garagesAccesses.some((g) => g.problemResolution && g.problemResolution.length);
  const isSubscribedValidEmails = garagesAccesses.some((g) => g.validEmails && g.validEmails.length);
  /** Determining the dataType(s) we'll query for each tab  */
  let leadsDataType = userAccesses.leads;
  let satisfactionDataType = userAccesses.satisfaction;
  let unsatisfiedDataType = userAccesses.problemResolution;
  let validEmailsDataType = userAccesses.validEmails;
  if (dataType) {
    leadsDataType = userAccesses.leads.includes(dataType) ? [dataType] : null;
    satisfactionDataType = userAccesses.satisfaction.includes(dataType) ? [dataType] : null;
    unsatisfiedDataType = userAccesses.problemResolution.includes(dataType) ? [dataType] : null;
    validEmailsDataType = userAccesses.validEmails.includes(dataType) ? [dataType] : null;
  }

  /** Launching the queries for each tab (satisfaction & validEmails are taken together from garageHistories) */
  const leadsKpis = await _aggregateKpiForLeads(garagesForLeads, period, leadsDataType, kpiConnector);
  const unsatisfiedKpis = await _aggregateKpiForUnsatisfied(
    garages,
    period,
    unsatisfiedDataType,
    isSubscribedProblemResolution,
    kpiConnector
  );
  const satisfactionKpis = isSubscribedSatisfaction
    ? await _aggregateKpiForSatisfaction(garages, period, satisfactionDataType, kpiConnector)
    : [];
  const validEmailsKpis = isSubscribedValidEmails
    ? await _aggregateKpiForValidEmails(garages, period, validEmailsDataType, kpiConnector)
    : [];

  /** Filling zeros for missing KPIs */
  fillConversionZeros(leadsKpis, garagesForLeads);

  /** Merging the results that came from the three queries above */
  const kpis = Object.values(
    [...leadsKpis, ...unsatisfiedKpis, ...satisfactionKpis, ...validEmailsKpis].reduce((acc, el) => {
      acc[el._id] = { ...acc[el._id], ...el };
      return acc;
    }, {})
  );

  return kpis;
};
