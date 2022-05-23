const _getLeadsRanking = require('./_getLeadsRanking');
const _getUnsatisfiedRanking = require('./_getUnsatisfiedRanking');

module.exports = async (garages, periods, dataType, userAccesses, garagesAccesses, kpiConnector) => {
  if (!garages || !Array.isArray(garages) || !garages.length) {
    return [];
  }
  /** Determining if we can get the main figure for each tab */
  const garagesForLeads = garagesAccesses.filter((g) => g.leads && g.leads.length);
  const isSubscribedProblemResolution = garagesAccesses.some((g) => g.problemResolution && g.problemResolution.length);
  /** Determining the dataType(s) we'll query for each tab  */
  let leadsDataType = userAccesses.leads;
  let unsatisfiedDataType = userAccesses.problemResolution;
  if (dataType) {
    leadsDataType = userAccesses.leads.includes(dataType) ? [dataType] : [];
    unsatisfiedDataType = userAccesses.problemResolution.includes(dataType) ? [dataType] : [];
  }
  const accessToLeads = garagesForLeads.length && leadsDataType.length;
  const accessToProblemResolution = isSubscribedProblemResolution && unsatisfiedDataType.length;

  /** Launching the queries for each tab */
  const leadsRanking = accessToLeads
    ? await _getLeadsRanking(garagesForLeads, periods, leadsDataType, kpiConnector)
    : [];
  const unsatisfiedRanking = accessToProblemResolution
    ? await _getUnsatisfiedRanking(garages, periods, unsatisfiedDataType, kpiConnector)
    : [];

  const fillInGarageName = (rankedEmployee) => {
    const employeesGarage = garages.find((g) => g.garageId === rankedEmployee.garageId.toString());
    rankedEmployee.garageName = (employeesGarage && employeesGarage.garageName) || '';
    delete rankedEmployee.garageId;
  };
  leadsRanking.forEach(fillInGarageName);
  unsatisfiedRanking.forEach(fillInGarageName);
  return {
    leads: leadsRanking,
    problemResolution: unsatisfiedRanking,
  };
};
