const { ObjectId } = require('mongodb');
const __Satisfaction = require('./data-generate-filters__satisfaction');
const __Leads = require('./data-generate-filters__leads');
const __Unsatisfied = require('./data-generate-filters__unsatisfied');
const __Contacts = require('./data-generate-filters__contacts');
const __Ereputaiton = require('./data-generate-filters__ereputation');
const GarageType = require('../../../../common/models/garage.type');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

class DataFilters {
  constructor() {
    this.filters = {};
  }

  // Common filters
  setGarageId(userGarages, garageId, { followed = false } = {}) {
    const garageField = followed ? 'source.garageId' : 'garageId';
    if (followed) {
      // In this case convert to ObjectId
      if (garageId){
        if (Object.prototype.toString.call(garageId) === '[object Array]'){
          if (garageId.length <= 1){
            this.filters[garageField] =  new ObjectId(garageId[0])
          }else {
            this.filters[garageField] =  { $in: garageId.map(ObjectId) }
          }
        }else {
          this.filters[garageField] =  new ObjectId(garageId)
        }
      }else {
        this.filters[garageField] = { $in: userGarages.map(ObjectId) }
      }
    } else {
      // In this case no conversion to ObjectId
      if (garageId){
        if (Object.prototype.toString.call(garageId) === '[object Array]'){
          if (garageId.length <= 1){
            this.filters[garageField] =  garageId[0]
          }else {
            this.filters[garageField] =  { $in: garageId.map((gId) => gId.toString()) }
          }
        }else {
          this.filters[garageField] = garageId;
        }
      }else {
        this.filters[garageField] = { $in: userGarages.map((gId) => gId.toString()) };
      }
    }
    return this;
  }

  setCockpitType(cockpitType){
    if (cockpitType) {
      const garageTypes = GarageType.getGarageTypesFromCockpitType(cockpitType);
      const types = garageTypes.length > 1 ? { $in: garageTypes } : garageTypes[0];
      this.filters.garageType = types;
    }
    return this;
  }

  setDateBoundaries(
    minDate,
    maxDate,
    { dateField = 'service.providedAt', filterDefaultDate = false, after, before } = {}
  ) {
    if (minDate && maxDate) {
      const minDateToTake = after && after.getTime() > minDate.getTime() ? after : minDate;
      const maxDateToTake = before && before.getTime() < maxDate.getTime() ? before : maxDate;
      this.filters.$and = [
        ...(this.filters.$and || []),
        { [dateField]: { $gt: minDateToTake } },
        { [dateField]: { $lt: maxDateToTake } },
      ];
    } else if (after && before) {
      this.filters.$and = [
        ...(this.filters.$and || []),
        { [dateField]: { $gt: after } },
        { [dateField]: { $lt: before } },
      ];
    } else if (after || before) {
      if (after) {
        this.filters[dateField] = { $gt: after };
      }
      if (before) {
        this.filters[dateField] = { $lt: before };
      }
    } else if (filterDefaultDate) {
      this.filters[dateField] = { $gt: new Date(0) };
    }

    return this;
  }

  setPeriodIdOrIntervalPeriods({ periodId, startPeriodId, endPeriodId }, options) {
    if (periodId) {
      return this.setPeriodId(periodId, options);
    }
    return this.setIntervalPeriods(startPeriodId, endPeriodId, options);
  }

  setPeriodId(periodId, { dateField = 'service.providedAt', filterDefaultDate = false, after, before } = {}) {
    if (periodId !== GarageHistoryPeriod.ALL_HISTORY) {
      const periodMinDate = GarageHistoryPeriod.getPeriodMinDate(periodId);
      const periodMaxDate = GarageHistoryPeriod.getPeriodMaxDate(periodId);
      return this.setDateBoundaries(periodMinDate, periodMaxDate, { dateField, filterDefaultDate, after, before });
    }
    return this.setDateBoundaries(null, null, { dateField, filterDefaultDate, after, before });
  }

  setIntervalPeriods(
    startPeriod,
    endPeriod,
    { dateField = 'service.providedAt', filterDefaultDate = false, after, before } = {}
  ) {
    const [startMin, startMax] = [
      GarageHistoryPeriod.getPeriodMinDate(startPeriod),
      GarageHistoryPeriod.getPeriodMaxDate(startPeriod),
    ];
    const [endMin, endMax] = [
      GarageHistoryPeriod.getPeriodMinDate(endPeriod),
      GarageHistoryPeriod.getPeriodMaxDate(endPeriod),
    ];
    // Reverse start & end if they're upside down
    const periodMinDate = startMin < endMin ? startMin : endMin;
    const periodMaxDate = endMax > startMax ? endMax : startMax;

    return this.setDateBoundaries(periodMinDate, periodMaxDate, { dateField, filterDefaultDate, after, before });
  }

  setType(type) {
    if (type && Array.isArray(type)) {
      this.filters.type = type.length === 1 ? type[0] : { $in: type };
    } else if (type) {
      this.filters.type = type;
    }

    return this;
  }

  setFrontDeskUserName(frontDeskUserName) {
    if (frontDeskUserName) {
      this.filters['service.frontDeskUserName'] = frontDeskUserName.replace(/%20/g, ' ');
    }
    return this;
  }

  setSearch(search) {
    if (search) {
      const findValue = DataFilters.searchCustomer(search);
      this.filters[findValue.key] = findValue.value;
    }
    return this;
  }
  static searchCustomer(searchRaw) {

    function checkPhone(search) {
      try {
        //Check with google library if the search is a phone number, if there is no prefix we take +33 by default
        phoneUtil.isPossibleNumber(phoneUtil.parse(search.match(/^\+/) ? search : '+33' + search))
        return true
      } catch (e) {
        return false
      }
    }

    let search = searchRaw.trim();
    if (search.match('@')) {
      // search by email
      return { key: 'customer.contact.email.value', value: search };
    }
    if (search.match(/\d/g) && search.match(/\d/g).length === 5) {
      // search by postal code
      return { key: 'customer.postalCode.value', value: search };
    }

    if (checkPhone(search)) {
      // clean +xx from phone numbers
      // '+33 7 69 34 19 95' => '341995'
      search = searchRaw.replace(/\+|\s/g, '');
      search = search.slice(-6);
      const regExp = new RegExp(search);
      return { key: 'customer.contact.mobilePhone.value', value: regExp };
    }

    const regExp = new RegExp(search.replace(/\+/, '').split(' ').join('|'), 'i');
    return { key: 'customer.fullName.value', value: regExp };

  }

  setDataId(dataId) {
    if (dataId) {
      this.filters = {
        _id: ObjectId(dataId),
      };
    }
    return this;
  }

  /** Generate the $match/query
   * Here the order is important, it's a little optimisation on Mongo's side
   * As per Mahima's words on our MongoDB training,
   * $in must be put in the beginning of the query to be treated as an equality
   * ranges ($lte, $gte, $lt, $gt) are put in the end in order to respect ESR rule
   */
  generateMatch() {
    const operatorsOrder = ['$in', '', '$ne', '$lte', '$gte', '$lt', '$gt'];
    const orderedFilters = Object.entries(this.filters).sort(([fieldA, filterA], [fieldB, filterB]) => {
      const usedOperatorA = DataFilters.determineFilterOperator(filterA);
      const usedOperatorB = DataFilters.determineFilterOperator(filterB);
      return operatorsOrder.indexOf(usedOperatorA) - operatorsOrder.indexOf(usedOperatorB);
    });
    return Object.fromEntries(orderedFilters);
  }

  static determineFilterOperator(filter) {
    const isObject = (obj) => obj === Object(obj);
    const operators = ['$in', '$ne', '$lte', '$gte', '$lt', '$gt'];
    const notOperators = ['$and', '$or'];
    if (!isObject(filter)) {
      return '';
    }
    for (const key in filter) {
      if (!isObject(filter[key])) {
        return '';
      }
      if (operators.includes(key)) {
        return key;
      }
      if (notOperators.includes(key)) {
        return DataFilters.determineFilterOperator(filter[key]);
      }
    }
    return '';
  }
}

// Including submodules here
Object.assign(DataFilters.prototype, __Satisfaction);
Object.assign(DataFilters.prototype, __Leads);
Object.assign(DataFilters.prototype, __Contacts);
Object.assign(DataFilters.prototype, __Unsatisfied);
Object.assign(DataFilters.prototype, __Ereputaiton);

module.exports = DataFilters;
