const moment = require('moment');
const _ = require('lodash');
const LeadSaleTypes = require('../../../../models/data/type/lead-sale-types');
const SourceTypes = require('../../../../models/data/type/source-types');
const GarageStatuses = require('../../../../models/garage.status');
const { getDeepFieldValue } = require('../../../util/object');
const { UnauthorizedError, NotFoundError, BadRequestError } = require('../apiErrors');
const { routesPermissions } = require('../route-permissions');

/**
API methods for leads
**/

/* eslint-disable no-param-reassign */
module.exports = (API, app, _hasAccess) => {
  const formatLeads = (leadDatas, fullData) => {
    return leadDatas.map((data) => {
      let res = {
        id: (data.id || data._id).toString(),
        garageId: data.garageId,
        score: getDeepFieldValue(data, 'review.rating.value'),
        comment: getDeepFieldValue(data, 'review.comment.text'),
        reportedAt: getDeepFieldValue(data, 'lead.reportedAt'),
        saleType: getDeepFieldValue(data, 'lead.saleType'),
        status: getDeepFieldValue(data, 'lead.type'),
        timing: getDeepFieldValue(data, 'lead.timing'),
        knownVehicle: getDeepFieldValue(data, 'lead.knowVehicle'),
        tradeIn: getDeepFieldValue(data, 'lead.tradeIn'),
        financing: getDeepFieldValue(data, 'lead.financing'),
        fullName: getDeepFieldValue(data, 'customer.fullName.value') || '',
        firstName: getDeepFieldValue(data, 'customer.firstName.value') || '',
        lastName: getDeepFieldValue(data, 'customer.lastName.value') || '',
        email: getDeepFieldValue(data, 'customer.contact.email.value') || '',
        telephone: getDeepFieldValue(data, 'customer.contact.mobilePhone.value') || '',
        gender: getDeepFieldValue(data, 'customer.gender.value') || undefined,
        brand: getDeepFieldValue(data, 'lead.brands') || undefined,
        model: getDeepFieldValue(data, 'lead.vehicle') || undefined,
      };

      const energyTypeArr = getDeepFieldValue(data, 'lead.energyType');
      if (Array.isArray(energyTypeArr) && energyTypeArr.filter((e) => e !== 'unknown').length) {
        res.energyType = energyTypeArr;
      }
      const bodyTypeArr = getDeepFieldValue(data, 'lead.bodyType');
      if (Array.isArray(bodyTypeArr) && bodyTypeArr.filter((e) => e !== 'unknown').length) {
        res.bodyType = bodyTypeArr;
      }
      if (fullData) {
        const registrationDate = getDeepFieldValue(data, 'vehicle.registrationDate.value');
        res = {
          ...res,
          title: getDeepFieldValue(data, 'customer.title.value'),
          streetAddress: getDeepFieldValue(data, 'customer.street.value'),
          postCode: getDeepFieldValue(data, 'customer.postalCode.value'),
          city: getDeepFieldValue(data, 'customer.city.value'),
          campaignId: getDeepFieldValue(data, 'campaign.campaignId'),
          // Véhicule courant pour MBParis
          currentVehicle: {
            brand: getDeepFieldValue(data, 'vehicle.make.value'),
            model: getDeepFieldValue(data, 'vehicle.model.value'),
            mileage: getDeepFieldValue(data, 'vehicle.mileage.value'),
            firstRegistration: registrationDate ? new Date(registrationDate).getFullYear() : '',
          },
        };
      }
      return res;
    });
  };

  const leadsByGarage = async function (appId, garageId, limit, skip) {
    try {

      const { authErr, auths, allGaragesAuthorized, fullData, withheldGarageData, garageTypesAuthorized } = await _hasAccess(
        appId,
        routesPermissions.LEADS,
        garageId,
      );

      if (authErr) {
        throw authErr
      }

      if (!allGaragesAuthorized && !auths.includes(garageId)) {
        throw new UnauthorizedError('You are not authorized to this garage');
      }
      const w = {
        //'lead.saleType': { inq: ["NewVehicleSale", "UsedVehicleSale", "Unknown"] },
        'lead.potentialSale': true,
        garageId,
      };

      let buildQuery = async () => w
      if (!withheldGarageData) {
        buildQuery = async () => {
          let runningGarages = await app.models.Garage.find(
            {
              where: {
                status: { inq: [GarageStatuses.RUNNING_AUTO, GarageStatuses.RUNNING_MANUAL] },
              },
            }
          );
          if (
            !runningGarages ||
            runningGarages.length === 0 ||
            !runningGarages.map((g) => g.id.toString()).includes(garageId)
          ) {
            throw new UnauthorizedError('Not authorized to withheld garages');
          }
          return w
        };
      }

      const where = await buildQuery();

      if (garageTypesAuthorized && garageTypesAuthorized.length) {
        where.garageType = { inq: garageTypesAuthorized };
      }
      const datas = await app.models.Data.find({ where, limit, skip, order: 'lead.reportedAt DESC' });

      if (!datas || datas.length === 0) {
        console.log(`No datas with leads for appId ${appId}`);
        return [];
      }

      return formatLeads(datas);
    } catch (err) {
      throw err
    }


  };

  const leadsByDate2 = async (
    appId,
    {
      garageIds = [],
      day,
      month,
      year,
      leadSaleType,
      source,
      dateField = 'lead.reportedAt',
      limit,
      after,
      allowNullLeadSaleType = false,
    },

  ) => {
    const { authErr, auths, allGaragesAuthorized, fullData, withheldGarageData, garageTypesAuthorized } = await _hasAccess(appId, routesPermissions.LEADS, null);

    if (authErr) {
      throw authErr;
    }

    // Date boundaries
    let dateMin, dateMax;
    try {
      const d = moment.tz(`${day}/${month}/${year}`, 'DD/MM/YYYY', 'Europe/Paris');
      dateMin = moment(d).startOf('day').toDate();
      dateMax = moment(d).endOf('day').toDate();
    } catch (e) {
      throw new BadRequestError(`Incorrect date parameters ${day}/${month}/${year}`);
    }


    // If we got no authorized garage => Error
    if (!allGaragesAuthorized && (!auths || !auths.length)) {
      throw new UnauthorizedError(`App ${appId} has no authorized garages`);
    }

    let garagesToQuery;
    if (!withheldGarageData) {
      const garageQuery = { status: { $in: [GarageStatuses.RUNNING_AUTO, GarageStatuses.RUNNING_MANUAL] } };
      const runningGaragesRes = await app.models.Garage.getMongoConnector().find(garageQuery, { _id: true }).toArray();
      const runningGarages = runningGaragesRes.map(({ _id }) => _id.toString());

      // I have a one liner for that but it's evil...
      if (allGaragesAuthorized === true) {
        garagesToQuery = garageIds.length ? _.intersection(runningGarages, garageIds) : runningGarages;
      } else {
        garagesToQuery = _.intersection(auths, runningGarages);
        if (garageIds.length) {
          garagesToQuery = _.intersection(garagesToQuery, garageIds);
        }
      }
    } else {
      if (allGaragesAuthorized !== true) {
        garagesToQuery = garageIds.length ? _.intersection(auths, garageIds) : auths;
      } else if (garageIds.length) {
        garagesToQuery = garageIds;
      }
    }

    if (after) {
      const singleData = await app.models.Data.findById(after);
      if (!singleData) throw new NotFoundError('No data for after parameter');
      dateMax = singleData.get(dateField);
    }

    let leadSaleTypeQuery;
    if (allowNullLeadSaleType) leadSaleTypeQuery = { 'lead.saleType': leadSaleType };
    else
      leadSaleTypeQuery = leadSaleType && LeadSaleTypes.hasValue(leadSaleType) ? { 'lead.saleType': leadSaleType } : {};

    const dataQuery = {
      'lead.potentialSale': true,
      $and: [{ [dateField]: { $gte: dateMin } }, { [dateField]: { $lt: dateMax } }],
      ...(garagesToQuery ? { garageId: { $in: garagesToQuery } } : {}),
      ...leadSaleTypeQuery,
      ...(source && SourceTypes.hasValue(source) ? { 'source.type': source } : {}),
    };
    if (garageTypesAuthorized && garageTypesAuthorized.length) {
      dataQuery.garageType = { $in: garageTypesAuthorized };
    }
    const projection = {
      _id: true,
      garageId: true,
      review: true,
      lead: true,
      customer: true,
      ...(fullData ? { campaign: true, vehicle: true } : {}),
    };
    const dataQueryOptions = { projection, limit, sort: { [dateField]: -1 } };
    const datas = await app.models.Data.getMongoConnector().find(dataQuery, dataQueryOptions).toArray();

    if (!datas || !datas.length) return [];
    // throw new NotFoundError(`No datas for appId ${appId} on ${day}/${month}/${year}`);

    return formatLeads(datas, fullData);
  };

  const leadsByDate = async function (appId, garageIds, day, month, year, dateField, limit, after) {
    // TODO: Transform calls to this function to be able to get rid of leadsByDate2
    try {
      const { authErr } = await _hasAccess(appId, routesPermissions.LEADS, null)

      if (authErr) {
        throw new UnauthorizedError(authErr.message);
      }

      const params = {
        garageIds: garageIds || [],
        day,
        month,
        year,
        dateField: dateField || 'lead.reportedAt',
        limit,
        after,
      };
      return await leadsByDate2(appId, params)
    } catch (err) {
      throw err
    }
  };

  API.leadsByGarage = leadsByGarage;
  API.leadsByDate = leadsByDate;
  API.leadsByDate2 = leadsByDate2;
};
