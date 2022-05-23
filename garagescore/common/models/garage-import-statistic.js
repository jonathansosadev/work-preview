const debug = require('debug')('garagescore:common:models:garageImportStatistic'); // eslint-disable-line max-len,no-unused-vars
const garageStatus = require('../../common/models/garage.status.js');

module.exports = (GarageImportStatistic) => {
  // eslint-disable-line no-unused-vars
  GarageImportStatistic.getGarageReport = function getGarageReport(garageImportStatistic) {
    // eslint-disable-line no-param-reassign
    const report = {
      // Global Counts
      countGarages: 0,
      countERepOnly: 0,
      countAutomatedGarages: 0,
      countAutomatedAPVGarages: 0,
      countAutomatedVnVoGarages: 0,
      countManualGarages: 0,
      countManualAPVGarages: 0,
      countManualVnVoGarages: 0,
      // Automated Garages Counts
      countAutomatedGaragesImportedLastWeek: 0,
      countAutomatedGaragesImportedAPVLastWeek: 0,
      countAutomatedGaragesImportedVnVoLastWeek: 0,
      countAutomatedGaragesImportedLastTwoWeek: 0,
      countAutomatedGaragesImportedVnVoLastTwoWeek: 0,
      // Automated Garages Lists
      automatedGaragesNotImportedAPVLastWeek: [],
      automatedGaragesNotImportedLastTwoWeek: [],
      automatedGaragesNotImportedVnVoLastTwoWeek: [],
      automatedGaragesVnNotImportedLastTwoWeek: [],
      automatedGaragesVoNotImportedLastTwoWeek: [],
      automatedGaragesImportedLessFourAPVTimeLastWeek: [],
      automatedGaragesWithNoRespondingAPVLastWeek: [],
      automatedGaragesWithNoRespondingAPVLastTwoWeek: [],
      // Manual Garages Counts
      countManualGaragesImportedLastWeek: 0,
      countManualGaragesImportedAPVLastWeek: 0,
      countManualGaragesImportedVnVoLastWeek: 0,
      countManualGaragesImportedLastTwoWeek: 0,
      countManualGaragesImportedVnVoLastTwoWeek: 0,
      // Manual Garages Lists
      manualGaragesNotImportedAPVLastWeek: [],
      manualGaragesNotImportedLastTwoWeek: [],
      manualGaragesNotImportedVnVoLastTwoWeek: [],
      manualGaragesVnNotImportedLastTwoWeek: [],
      manualGaragesVoNotImportedLastTwoWeek: [],
      manualGaragesImportedLessFourAPVTimeLastWeek: [],
      manualGaragesWithNoRespondingAPVLastWeek: [],
      manualGaragesWithNoRespondingAPVLastTwoWeek: [],
      // ??
      garagesLessThe20PercentRespondingLastQuarter: [],
    };
    function hasApvFile(importStat, period) {
      return (
        importStat[period] &&
        (importStat[period].countMaintenancesCompleted > 0 || importStat[period].countMixedCompleted > 0)
      );
    }
    function hasVnFile(importStat, period) {
      return (
        importStat[period] &&
        (importStat[period].countNewVehicleSalesCompleted > 0 ||
          importStat[period].countMixedVehicleSalesCompleted > 0 ||
          importStat[period].countMixedCompleted > 0)
      );
    }
    function hasVoFile(importStat, period) {
      return (
        importStat[period] &&
        (importStat[period].countUsedVehicleSalesCompleted > 0 ||
          importStat[period].countMixedVehicleSalesCompleted > 0 ||
          importStat[period].countMixedCompleted > 0)
      );
    }

    garageImportStatistic.statistics.forEach((importStat) => {
      report.countGarages++;

      // AUTOMATED GARAGES
      if (importStat.garageInfo && importStat.garageInfo.status === garageStatus.RUNNING_AUTO) {
        report.countAutomatedGarages++;
        if (importStat.garageInfo.subscriptions.Maintenance) {
          report.countAutomatedAPVGarages++;
          if (hasApvFile(importStat, 'lastWeekDataFiles')) {
            report.countAutomatedGaragesImportedAPVLastWeek++;
          } else {
            report.automatedGaragesNotImportedAPVLastWeek.push(importStat.garageInfo);
          }
        }
        if (importStat.garageInfo.subscriptions.NewVehicleSale || importStat.garageInfo.subscriptions.UsedVehicleSale) {
          report.countAutomatedVnVoGarages++;
          if (hasVnFile(importStat, 'lastTwoWeekDataFiles') || hasVoFile(importStat, 'lastTwoWeekDataFiles')) {
            report.countAutomatedGaragesImportedVnVoLastTwoWeek++;
          } else {
            report.automatedGaragesNotImportedVnVoLastTwoWeek.push(importStat.garageInfo);
          }
          if (hasVnFile(importStat, 'lastWeekDataFiles') || hasVoFile(importStat, 'lastWeekDataFiles')) {
            report.countAutomatedGaragesImportedVnVoLastWeek++;
          }
        }
        if (importStat.lastWeekDataFiles && importStat.lastWeekDataFiles.countCompleted > 0) {
          report.countAutomatedGaragesImportedLastWeek++;
        }

        if (importStat.lastTwoWeekDataFiles && importStat.lastTwoWeekDataFiles.countCompleted > 0) {
          report.countAutomatedGaragesImportedLastTwoWeek++;
        } else {
          report.automatedGaragesNotImportedLastTwoWeek.push(importStat.garageInfo);
        }

        if (
          importStat.lastWeekDataFiles &&
          importStat.lastWeekDataFiles.countMaintenancesCompleted + importStat.lastWeekDataFiles.countMixedCompleted <
            4 &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          report.automatedGaragesImportedLessFourAPVTimeLastWeek.push(importStat.garageInfo);
        }
        if (
          importStat.lastWeekDataFiles &&
          importStat.lastWeekDataFiles.countSurveysResponded === 0 &&
          importStat.garageInfo.campaignDelays.maintenance === 0 &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          report.automatedGaragesWithNoRespondingAPVLastWeek.push(importStat.garageInfo);
        }
        if (
          importStat.lastTwoWeekDataFiles &&
          importStat.lastTwoWeekDataFiles.countSurveysResponded === 0 &&
          importStat.garageInfo.campaignDelays.maintenance === 0 &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          report.automatedGaragesWithNoRespondingAPVLastTwoWeek.push(importStat.garageInfo);
        }
        if (!hasVnFile(importStat, 'lastTwoWeekDataFiles') && importStat.garageInfo.subscriptions.NewVehicleSale) {
          report.automatedGaragesVnNotImportedLastTwoWeek.push(importStat.garageInfo);
        }
        if (!hasVoFile(importStat, 'lastTwoWeekDataFiles') && importStat.garageInfo.subscriptions.UsedVehicleSale) {
          report.automatedGaragesVoNotImportedLastTwoWeek.push(importStat.garageInfo);
        }
      }

      // MANUAL GARAGES
      if (importStat.garageInfo && importStat.garageInfo.status === garageStatus.RUNNING_MANUAL) {
        report.countManualGarages++;
        if (importStat.garageInfo.subscriptions.Maintenance) {
          report.countManualAPVGarages++;
          if (hasApvFile(importStat, 'lastWeekDataFiles')) {
            report.countManualGaragesImportedAPVLastWeek++;
          } else {
            report.manualGaragesNotImportedAPVLastWeek.push(importStat.garageInfo);
          }
        }
        if (importStat.garageInfo.subscriptions.NewVehicleSale || importStat.garageInfo.subscriptions.UsedVehicleSale) {
          report.countManualVnVoGarages++;
          if (hasVnFile(importStat, 'lastTwoWeekDataFiles') || hasVoFile(importStat, 'lastTwoWeekDataFiles')) {
            report.countManualGaragesImportedVnVoLastTwoWeek++;
          } else {
            report.manualGaragesNotImportedVnVoLastTwoWeek.push(importStat.garageInfo);
          }
          if (hasVnFile(importStat, 'lastWeekDataFiles') || hasVoFile(importStat, 'lastWeekDataFiles')) {
            report.countManualGaragesImportedVnVoLastWeek++;
          }
        }
        if (importStat.lastWeekDataFiles && importStat.lastWeekDataFiles.countCompleted > 0) {
          report.countManualGaragesImportedLastWeek++;
        }

        if (importStat.lastTwoWeekDataFiles && importStat.lastTwoWeekDataFiles.countCompleted > 0) {
          report.countManualGaragesImportedLastTwoWeek++;
        } else {
          report.manualGaragesNotImportedLastTwoWeek.push(importStat.garageInfo);
        }

        if (
          importStat.lastWeekDataFiles &&
          importStat.lastWeekDataFiles.countMaintenancesCompleted + importStat.lastWeekDataFiles.countMixedCompleted <
            4 &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          report.manualGaragesImportedLessFourAPVTimeLastWeek.push(importStat.garageInfo);
        }
        if (
          importStat.lastWeekDataFiles &&
          importStat.lastWeekDataFiles.countSurveysResponded === 0 &&
          importStat.garageInfo.campaignDelays.maintenance === 0 &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          report.manualGaragesWithNoRespondingAPVLastWeek.push(importStat.garageInfo);
        }
        if (
          importStat.lastTwoWeekDataFiles &&
          importStat.lastTwoWeekDataFiles.countSurveysResponded === 0 &&
          importStat.garageInfo.campaignDelays.maintenance === 0 &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          report.manualGaragesWithNoRespondingAPVLastTwoWeek.push(importStat.garageInfo);
        }
        if (!hasVnFile(importStat, 'lastTwoWeekDataFiles') && importStat.garageInfo.subscriptions.NewVehicleSale) {
          report.manualGaragesVnNotImportedLastTwoWeek.push(importStat.garageInfo);
        }
        if (!hasVoFile(importStat, 'lastTwoWeekDataFiles') && importStat.garageInfo.subscriptions.UsedVehicleSale) {
          report.manualGaragesVoNotImportedLastTwoWeek.push(importStat.garageInfo);
        }
      }

      // EREP GARAGES
      if (importStat.garageInfo && importStat.garageInfo.status === garageStatus.EREP_ONLY) {
        report.countERepOnly++;
      }

      if (
        importStat.lastQuarterHistory &&
        importStat.lastQuarterHistory.countSurveysResponded > 2 &&
        importStat.lastQuarterHistory.countShouldReceiveSurveys > 2 &&
        importStat.lastQuarterHistory.countSurveysResponded <
          importStat.lastQuarterHistory.countShouldReceiveSurveys / 5
      ) {
        importStat.garageInfo.countLastQuarterSurveysResponded = importStat.lastQuarterHistory.countSurveysResponded; // eslint-disable-line no-param-reassign, max-len
        importStat.garageInfo.countLastQuarterShouldReceiveSurveys =
          importStat.lastQuarterHistory.countShouldReceiveSurveys; // eslint-disable-line no-param-reassign, max-len
        importStat.garageInfo.countLastQuarterResponsePercent = // eslint-disable-line no-param-reassign, max-len
          parseInt(
            (importStat.lastQuarterHistory.countSurveysResponded * 1000) /
              importStat.lastQuarterHistory.countShouldReceiveSurveys,
            10
          ) / 10;
        report.garagesLessThe20PercentRespondingLastQuarter.push(importStat.garageInfo);
      }
    });
    return report;
  };

  GarageImportStatistic.filterGarageImportProblem = function filterGarageImportProblem(garageImportStatistic) {
    // eslint-disable-line no-param-reassign, max-len
    const results = [];
    garageImportStatistic.statistics.forEach((importStat) => {
      const problems = [];
      if (
        importStat.lastWeekDataFiles &&
        importStat.lastWeekDataFiles.countMaintenancesCompleted + importStat.lastWeekDataFiles.countMixedCompleted <
          4 &&
        importStat.garageInfo.subscriptions.Maintenance &&
        importStat.garageInfo.status === garageStatus.RUNNING_AUTO
      ) {
        problems.push(
          'Le nombre de fichiers importés APV sans erreur est < 4 pendant la semaine dernière (garage branché)'
        );
      }
      if (importStat.lastTwoWeekDataFiles) {
        if (
          !importStat.lastTwoWeekDataFiles.countMixedVehicleSalesCompleted &&
          !importStat.lastTwoWeekDataFiles.countNewVehicleSalesCompleted &&
          !importStat.lastTwoWeekDataFiles.countMixedCompleted &&
          importStat.garageInfo.subscriptions.NewVehicleSale &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO
        ) {
          problems.push(
            "Aucun fichier Vente Neuf n'était importé sans erreur pendant les deux dernière semaine (garage branché)"
          );
        }
        if (
          !importStat.lastTwoWeekDataFiles.countMixedVehicleSalesCompleted &&
          !importStat.lastTwoWeekDataFiles.countUsedVehicleSalesCompleted &&
          !importStat.lastTwoWeekDataFiles.countMixedCompleted &&
          importStat.garageInfo.subscriptions.UsedVehicleSale &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO
        ) {
          problems.push(
            "Aucun fichier Vente Occasion n'était importé sans erreur pendant les deux dernière semaine (garage branché)"
          );
        }
        if (
          importStat.lastTwoWeekDataFiles.countCompleted === 0 &&
          importStat.garageInfo.status === garageStatus.RUNNING_MANUAL
        ) {
          problems.push(
            "Aucun fichier n'était importé sans erreur pendant " +
              'les deux dernière semaine (garage non branché mais importé manuellement)'
          );
        }
      }
      if (importStat.lastWeekHistory && importStat.garageInfo) {
        if (
          importStat.lastWeekHistory.countSurveysResponded === 0 &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO
        ) {
          problems.push("Aucun avis n'était reçu pendant la semaine dernière (garage branché)");
        }
        if (
          importStat.lastWeekHistory.countSurveyRespondedAPV > 2 &&
          importStat.lastWeekHistory.countSurveyRespondedAPV <
            importStat.lastWeekHistory.countShouldReceiveSurveysAPV / 12.5 &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO &&
          importStat.garageInfo.subscriptions.Maintenance
        ) {
          problems.push('Taux de réponse APV pendant la semaine dernière < 8% (garage branché)');
        }
      }
      if (importStat.lastTwoWeekHistory && importStat.garageInfo) {
        if (
          importStat.lastTwoWeekHistory.countSurveyRespondedVN > 2 &&
          importStat.lastTwoWeekHistory.countSurveyRespondedVN <
            importStat.lastTwoWeekHistory.countShouldReceiveSurveysVN / 12.5 &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO &&
          importStat.garageInfo.subscriptions.NewVehicleSale
        ) {
          problems.push('Taux de réponse VN pendant deux dernière semaine < 8% (garage branché)');
        }
        if (
          importStat.lastTwoWeekHistory.countSurveyRespondedVO > 2 &&
          importStat.lastTwoWeekHistory.countSurveyRespondedVO <
            importStat.lastTwoWeekHistory.countShouldReceiveSurveysVO / 12.5 &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO &&
          importStat.garageInfo.subscriptions.UsedVehicleSale
        ) {
          problems.push('Taux de réponse VO pendant deux dernière semaine < 8% (garage branché)');
        }
        if (
          importStat.lastTwoWeekHistory.countSurveyRespondedSale > 2 &&
          importStat.lastTwoWeekHistory.countSurveyRespondedSale <
            importStat.lastTwoWeekHistory.countShouldReceiveSurveysSale / 12.5 &&
          importStat.garageInfo.status === garageStatus.RUNNING_AUTO &&
          importStat.garageInfo.subscriptions.UsedVehicleSale
        ) {
          problems.push('Taux de réponse VO pendant deux dernière semaine < 8% (garage branché)');
        }
      }
      if (importStat.lastQuarterHistory) {
        if (
          importStat.lastQuarterHistory.countSurveysResponded > 2 &&
          importStat.lastQuarterHistory.countSurveysResponded <
            importStat.lastQuarterHistory.countShouldReceiveSurveys / 5
        ) {
          problems.push('Taux de réponse pendant les 90 derniers jours < 20%');
        }
      }
      if (problems.length > 0) {
        const res1 = JSON.parse(JSON.stringify(importStat.garageInfo));
        res1.problems = problems;
        results.push(res1);
      }
    });
    return results;
  };
};
