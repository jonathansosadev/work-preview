const moment = require('moment');
const app = require('../../../../server/server');
const timeHelper = require('../../util/time-helper');
const garageIdsSubset = require('./garage-ids-subset');
const garageStatus = require('../../../models/garage.status.js');

/*
Returns:
- for each day, a count of garages ok and ko
- for each garage, an errors count by datafile type for the whole period
- for each garage, an errors count by datafile type for the last day
*/
const datafilesImports = (minDate, maxDate, callback) => {
  const fields = {
    id: true,
    publicDisplayName: true,
  };
  app.models.Garage.find({ fields }, (errFindGarages, garages) => {
    if (errFindGarages) {
      callback(errFindGarages);
      return;
    }
    const garagesData = {};
    garages.forEach((ga) => {
      if (ga.id) {
        garagesData[ga.id.toString()] = ga;
      }
    });
    const start = timeHelper.dayNumber(minDate.toDate());
    const end = timeHelper.dayNumber(maxDate.toDate());
    const where = {};
    where.and = [{ daysFromEpoch: { gt: start } }, { daysFromEpoch: { lte: end } }];
    app.models.ConsolidatedGaragesStatistic.find({ where, order: 'daysFromEpoch ASC' }, (e, data) => {
      if (e) {
        callback(e);
        return;
      }
      const results = { perDay: {} };
      const errorsCountPerGarageForThePeriod = { all: {}, apv: {}, vn: {}, vo: {}, mixedsales: {}, mixed: {} };
      const errorsCountPerGarageForTheLastDay = { all: {}, apv: {}, vn: {}, vo: {}, mixedsales: {}, mixed: {} };
      garages.forEach((ga) => {
        if (ga.id) {
          const gaId = ga.id.toString();
          errorsCountPerGarageForThePeriod.all[gaId] = 0;
          errorsCountPerGarageForThePeriod.apv[gaId] = 0;
          errorsCountPerGarageForThePeriod.vn[gaId] = 0;
          errorsCountPerGarageForThePeriod.vo[gaId] = 0;
          errorsCountPerGarageForThePeriod.mixedsales[gaId] = 0;
          errorsCountPerGarageForThePeriod.mixed[gaId] = 0;

          errorsCountPerGarageForTheLastDay.all[gaId] = 0;
          errorsCountPerGarageForTheLastDay.apv[gaId] = 0;
          errorsCountPerGarageForTheLastDay.vn[gaId] = 0;
          errorsCountPerGarageForTheLastDay.vo[gaId] = 0;
          errorsCountPerGarageForTheLastDay.mixedsales[gaId] = 0;
          errorsCountPerGarageForTheLastDay.mixed[gaId] = 0;
        }
      });
      data.forEach((d) => {
        results.perDay[moment(timeHelper.dayNumberToDate(d.daysFromEpoch)).format('DD/MM/YYYY').toString()] = {
          importsOK: {
            all: { garagesCount: d.importedFilesWithSuccessNbOfGarages },
            apv: { garagesCount: d.importedApvFilesNbOfGarages },
            vn: { garagesCount: d.importedVnFilesNbOfGarages },
            vo: { garagesCount: d.importedVoFilesNbOfGarages },
            mixedsales: { garagesCount: d.importedMixedSalesFilesNbOfGarages },
            mixed: { garagesCount: d.importedMixedFilesNbOfGarages },
          },
          importsKO: {
            all: { garagesCount: d.importedFilesWithErrorNbOfGarages },
            apv: { garagesCount: d.importedApvFilesWithErrorNbOfGarages },
            vn: { garagesCount: d.importedVnFilesWithErrorNbOfGarages },
            vo: { garagesCount: d.importedVoFilesWithErrorNbOfGarages },
            mixedsales: { garagesCount: d.importedMixedSalesFilesWithErrorNbOfGarages },
            mixed: { garagesCount: d.importedMixedFilesWithErrorNbOfGarages },
          },
        };
        const totalErrorGarages = garageIdsSubset.decodeSubset(d.allGarageIds, d.importedFilesWithErrorIdsOfGarages);
        totalErrorGarages.forEach((gid) => errorsCountPerGarageForThePeriod.all[gid]++);
        const totalErrorGaragesAPV = garageIdsSubset.decodeSubset(
          d.allGarageIds,
          d.importedApvFilesWithErrorIdsOfGarages
        );
        totalErrorGaragesAPV.forEach((gid) => errorsCountPerGarageForThePeriod.apv[gid]++);
        const totalErrorGaragesVN = garageIdsSubset.decodeSubset(
          d.allGarageIds,
          d.importedVnFilesWithErrorIdsOfGarages
        );
        totalErrorGaragesVN.forEach((gid) => errorsCountPerGarageForThePeriod.vn[gid]++);
        const totalErrorGaragesVO = garageIdsSubset.decodeSubset(
          d.allGarageIds,
          d.importedVoFilesWithErrorIdsOfGarages
        );
        totalErrorGaragesVO.forEach((gid) => errorsCountPerGarageForThePeriod.vo[gid]++);
        const totalErrorGaragesMixedSales = garageIdsSubset.decodeSubset(
          d.allGarageIds,
          d.importedMixedSalesFilesWithErrorIdsOfGarages
        );
        totalErrorGaragesMixedSales.forEach((gid) => errorsCountPerGarageForThePeriod.mixedsales[gid]++);
        const totalErrorGaragesMixed = garageIdsSubset.decodeSubset(
          d.allGarageIds,
          d.importedMixedFilesWithErrorIdsOfGarages
        );
        totalErrorGaragesMixed.forEach((gid) => errorsCountPerGarageForThePeriod.mixed[gid]++);

        if (d.daysFromEpoch === end) {
          const totalErrorGaragesForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.importedFilesWithErrorIdsOfGarages
          );
          totalErrorGaragesForTheLastDay.forEach((gid) => {
            errorsCountPerGarageForTheLastDay.all[gid] = 1;
          });
          const totalErrorGaragesAPVForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.importedApvFilesWithErrorIdsOfGarages
          );
          totalErrorGaragesAPVForTheLastDay.forEach((gid) => {
            errorsCountPerGarageForTheLastDay.apv[gid] = 1;
          });
          const totalErrorGaragesVNForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.importedVnFilesWithErrorIdsOfGarages
          );
          totalErrorGaragesVNForTheLastDay.forEach((gid) => {
            errorsCountPerGarageForTheLastDay.vn[gid] = 1;
          });
          const totalErrorGaragesVOForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.importedVoFilesWithErrorIdsOfGarages
          );
          totalErrorGaragesVOForTheLastDay.forEach((gid) => {
            errorsCountPerGarageForTheLastDay.vo[gid] = 1;
          });
          const totalErrorGaragesMixedSalesForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.importedMixedSalesFilesWithErrorIdsOfGarages
          ); // eslint-disable-line max-len
          totalErrorGaragesMixedSalesForTheLastDay.forEach((gid) => {
            errorsCountPerGarageForTheLastDay.mixedsales[gid] = 1;
          });
          const totalErrorGaragesMixedForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.importedMixedFilesWithErrorIdsOfGarages
          ); // eslint-disable-line max-len
          totalErrorGaragesMixedForTheLastDay.forEach((gid) => {
            errorsCountPerGarageForTheLastDay.mixed[gid] = 1;
          });
        }
      });
      // remove garages without errors
      const remove0Value = (o) => {
        const keys = Object.keys(o);
        keys.forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(o, k) && o[k] === 0) {
            delete o[k];
          } // eslint-disable-line
        });
      };
      remove0Value(errorsCountPerGarageForThePeriod.all);
      remove0Value(errorsCountPerGarageForThePeriod.apv);
      remove0Value(errorsCountPerGarageForThePeriod.vn);
      remove0Value(errorsCountPerGarageForThePeriod.vo);
      remove0Value(errorsCountPerGarageForThePeriod.mixedsales);
      remove0Value(errorsCountPerGarageForThePeriod.mixed);

      remove0Value(errorsCountPerGarageForTheLastDay.all);
      remove0Value(errorsCountPerGarageForTheLastDay.apv);
      remove0Value(errorsCountPerGarageForTheLastDay.vn);
      remove0Value(errorsCountPerGarageForTheLastDay.vo);
      remove0Value(errorsCountPerGarageForTheLastDay.mixedsales);
      remove0Value(errorsCountPerGarageForTheLastDay.mixed);
      results.errorsCountPerGarage = {
        period: errorsCountPerGarageForThePeriod,
        lastDay: errorsCountPerGarageForTheLastDay,
      };
      results.garagesData = garagesData;
      callback(null, results);
    });
  });
};
/*
Returns:
- for each day, a count of garages with a campaign created in apv and sales and both
- for each garage, an errors count by datafile type for the whole period
- for each garage, an errors count by datafile type for the last day
*/
const campaignsCreation = (minDate, maxDate, callback) => {
  const fields = {
    id: true,
    publicDisplayName: true,
    status: true,
    subscriptions: true,
  };
  app.models.Garage.find({ fields }, (errFindGarages, garages) => {
    if (errFindGarages) {
      callback(errFindGarages);
      return;
    }
    const garagesData = {};
    garages.forEach((ga) => {
      if (ga.id) {
        garagesData[ga.id.toString()] = ga;
      }
    });
    const start = timeHelper.dayNumber(minDate.toDate());
    const end = timeHelper.dayNumber(maxDate.toDate());
    const where = {};
    where.and = [{ daysFromEpoch: { gt: start } }, { daysFromEpoch: { lte: end } }];
    app.models.ConsolidatedGaragesStatistic.find({ where, order: 'daysFromEpoch ASC' }, (e, data) => {
      if (e) {
        callback(e);
        return;
      }
      const results = { perDay: {} };
      const missingCampaignForThePeriod = { all: {}, apv: {}, sales: {} };
      const missingCampaignForTheLastDay = { all: {}, apv: {}, sales: {} };
      garages.forEach((ga) => {
        if (ga.id) {
          const gaId = ga.id.toString();
          // only missing if they have a subscription
          missingCampaignForThePeriod.apv[gaId] =
            ga.status && garageStatus.isRunning(ga.status) && ga.isSubscribed('Maintenance'); // eslint-disable-line max-len
          missingCampaignForThePeriod.sales[gaId] =
            ga.status &&
            garageStatus.isRunning(ga.status) &&
            (ga.isSubscribed('NewVehicleSale') || ga.isSubscribed('UsedVehicleSale')); // eslint-disable-line max-len

          missingCampaignForTheLastDay.apv[gaId] =
            ga.status && garageStatus.isRunning(ga.status) && ga.isSubscribed('Maintenance'); // eslint-disable-line max-len
          missingCampaignForTheLastDay.sales[gaId] =
            ga.status &&
            garageStatus.isRunning(ga.status) &&
            (ga.isSubscribed('NewVehicleSale') || ga.isSubscribed('UsedVehicleSale')); // eslint-disable-line max-len
        }
      });
      data.forEach((d) => {
        results.perDay[moment(timeHelper.dayNumberToDate(d.daysFromEpoch)).format('DD/MM/YYYY').toString()] = {
          garagesWithCampaign: {
            all: { garagesCount: d.createdCampaignsNbOfGarages },
            apv: { garagesCount: d.createdApvCampaignsNbOfGarages },
            sales: { garagesCount: d.createdSaleCampaignsNbOfGarages },
          },
        };

        const totalCreatedCampaigns = garageIdsSubset.decodeSubset(d.allGarageIds, d.createdCampaignsIdsOfGarages);
        totalCreatedCampaigns.forEach((gid) => {
          missingCampaignForThePeriod.all[gid] = false;
        });
        const apvCreatedCampaigns = garageIdsSubset.decodeSubset(d.allGarageIds, d.createdApvCampaignsIdsOfGarages);
        apvCreatedCampaigns.forEach((gid) => {
          missingCampaignForThePeriod.apv[gid] = false;
        });
        const salesCreatedCampaigns = garageIdsSubset.decodeSubset(d.allGarageIds, d.createdSaleCampaignsIdsOfGarages);
        salesCreatedCampaigns.forEach((gid) => {
          missingCampaignForThePeriod.sales[gid] = false;
        });

        if (d.daysFromEpoch === end) {
          const totalCreatedCampaignsForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.createdCampaignsIdsOfGarages
          );
          totalCreatedCampaignsForTheLastDay.forEach((gid) => {
            missingCampaignForTheLastDay.all[gid] = false;
          });
          const apvCreatedCampaignsForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.createdApvCampaignsIdsOfGarages
          );
          apvCreatedCampaignsForTheLastDay.forEach((gid) => {
            missingCampaignForTheLastDay.apv[gid] = false;
          });
          const salesCreatedCampaignsForTheLastDay = garageIdsSubset.decodeSubset(
            d.allGarageIds,
            d.createdSaleCampaignsIdsOfGarages
          );
          salesCreatedCampaignsForTheLastDay.forEach((gid) => {
            missingCampaignForTheLastDay.sales[gid] = false;
          });
        }
      });
      // remove garages without errors
      const removeFalseyValue = (o) => {
        const keys = Object.keys(o);
        keys.forEach((k) => {
          if (Object.prototype.hasOwnProperty.call(o, k) && !o[k]) {
            delete o[k];
          } // eslint-disable-line
        });
      };
      removeFalseyValue(missingCampaignForThePeriod.all);
      removeFalseyValue(missingCampaignForThePeriod.apv);
      removeFalseyValue(missingCampaignForThePeriod.sales);

      removeFalseyValue(missingCampaignForTheLastDay.all);
      removeFalseyValue(missingCampaignForTheLastDay.apv);
      removeFalseyValue(missingCampaignForTheLastDay.sales);
      results.missingCampaign = {
        period: missingCampaignForThePeriod,
        lastDay: missingCampaignForTheLastDay,
      };
      results.garagesData = garagesData;
      callback(null, results);
    });
  });
};

module.exports = { datafilesImports, campaignsCreation };

/*
const ss = moment().subtract(7, 'd');
const ee = moment().subtract(0, 'd');
campaignsCreation(ss, ee, (e, data) => {
  if (e) { console.log(e); }
  console.log(JSON.stringify(data, null, 2));
  console.log(data);
  process.exit();
}); */
