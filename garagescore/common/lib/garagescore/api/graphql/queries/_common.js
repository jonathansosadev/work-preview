const stringUtil = require('../../../../util/string');
const garageType = require('../../../../../models/garage.type');
const dataTypes = require('../../../../../models/data/type/data-types');
const { filterGaragesByType } = require('../../../cache/garage-type');
const { isGod } = require('../../../../../models/user/user-methods');
const { JS, log } = require('../../../../util/log');

module.exports = {
  getSearchFilterRegexp(searchedWord, getRegexpObject, removeSpaces, replaceSpacesByOr) {
    let result = searchedWord;
    if (removeSpaces) {
      result = stringUtil.removeSpaces(result);
    }
    if (replaceSpacesByOr) {
      result = result.replace(' ', '|');
    }
    // Thank god we aren't selling in Poland
    result = result.replace(/[aàáâãäå]/gi, '[aàáâãäå]');
    result = result.replace(/[eéèëê]/gi, '[eéèëê]');
    result = result.replace(/[iìíîï]/gi, '[iìíîï]');
    result = result.replace(/[oòóôõö]/gi, '[oòóôõö]');
    result = result.replace(/[uùúûü]/gi, '[uùúûü]');
    result = result.replace(/[cç]/gi, '[cç]');
    result = result.replace(/[nñ]/gi, '[nñ]');
    result = result.replace(/[yýÿ]/gi, '[yýÿ]');
    result = result.replace(/\*/g, '\\*');
    if (getRegexpObject) {
      result = new RegExp(`(${result})`, 'i');
    } else {
      result = `/${result}/i`;
    }
    return result;
  },
  addTextSearchToFilters(filters, searchRaw) {
    let search = searchRaw.trim();
    search = search.replace(/^\+\d+\s/, ''); // clean +xx from phone numbers
    if (search.match('@')) {
      // only search the left side
      const split = search
        .split('@')[0]
        .split('@')[0]
        .split(/[\\.-]/)
        .map((t) => `"${t}"`)
        .join(' ');
      // 'puyravaud.gilbert@neuf.fr' => 'puyravaud" "gilbert"'
      filters.where['$text'] = { $search: split, $language: 'none' };
    } else if (search.match(/\d/g) && search.match(/\d/g).length === 5) {
      filters.where['$text'] = { $search: `"${search}"`, $language: 'none' };
    } else if (search.match(/\d /g) && search.length > 5) {
      search = search.replace(/\s/g, '');
      // only keep the last 12 numbers
      search = search.slice(-6);
      // format them aa bb cc with a crazy chain
      search = search
        .split('')
        .reverse()
        .join('')
        .replace(/(.{2})/g, '$1 ')
        .split('')
        .reverse()
        .join('')
        .trim();
      // '+33 7 69 34 19 95' => '34 19 95'
      filters.where['$text'] = { $search: `"${search}"`, $language: 'none' };
    } else {
      filters.where['$text'] = { $search: search, $language: 'none' };
    }
  },
  addTextSearchToFiltersForUsers(search) {
    const query = { $or: [] };
    search = search.trim();
    let searchRegexp = this.getSearchFilterRegexp(search, true, true);
    if (search.includes('@')) {
      query.email = searchRegexp;
    } else if (isNaN(search) === false && search.length > 9) {
      query.$or.push({ phone: searchRegexp });
      query.$or.push({ mobilePhone: searchRegexp });
    } else if (search.split(' ').length === 2) {
      query.$or.push({
        firstName: this.getSearchFilterRegexp(search.split(' ')[0], true),
        lastName: this.getSearchFilterRegexp(search.split(' ')[1], true),
      });

      query.$or.push({
        firstName: this.getSearchFilterRegexp(search.split(' ')[1], true),
        lastName: this.getSearchFilterRegexp(search.split(' ')[0], true),
      });
    } else if (search.split(' ').length > 2) {
      searchRegexp = this.getSearchFilterRegexp(search, true, false, true);
      query.firstName = searchRegexp;
      query.lastName = searchRegexp;
    } else {
      query.$or.push({ firstName: searchRegexp });
      query.$or.push({ lastName: searchRegexp });
      query.$or.push({ phone: searchRegexp });
      query.$or.push({ mobilePhone: searchRegexp });
      query.$or.push({ email: searchRegexp });
    }
    if (!query.$or.length) {
      delete query.$or;
    }
    return query;
  },
  addTextSearchToFiltersForGarages(filters, search) {
    search = search.trim();
    const searchRegexp = this.getSearchFilterRegexp(search, true);
    if (filters && filters.where) {
      filters.where.or = [{ slug: searchRegexp }, { publicDisplayName: searchRegexp }, { externalId: searchRegexp }];
    } else {
      return [{ slug: searchRegexp }, { publicDisplayName: searchRegexp }, { externalId: searchRegexp }];
    }
    return [];
  },
  // add to the request a filter on one, various or no garageId
  async addGarageIdToFilters(req, args, filters) {
    const { cockpitType, garageId, type, user } = args;
    if (isGod(user)) {
      log.debug(JS, '[GOD MODE] activated');
      if (cockpitType) {
        filters.where.garageType = { inq: garageType.getGarageTypesFromCockpitType(cockpitType) };
        log.debug(JS, `[GOD MODE] cockpitType=${cockpitType} => garageType: {${filters.where.garageType}} `);
      }
      if (garageId) {
        filters.where.garageId = garageId;
        return;
      }
      return;
    }
    let erepGarages = null;
    const { garageIds } = req.user;
    let userGarages = garageIds ? garageIds.map((g) => g.toString()) : null;
    if (args.cockpitType && userGarages && !args.garageId)
      userGarages = await filterGaragesByType(userGarages, args.cockpitType);
    const garageIdInRequest = args.garageId && args.garageId.toString();

    if (type === dataTypes.EXOGENOUS_REVIEW) {
      erepGarages = await req.app.models.Garage.find({
        where: { 'subscriptions.EReputation.enabled': true, 'subscriptions.active': true },
        fields: { id: true },
      });
      erepGarages = erepGarages.map((g) => g.getId().toString());
    }

    // results with no garageId filter in url
    if (!garageIdInRequest) {
      // no erep, user has every garages
      if (!userGarages && !erepGarages) {
        return Promise.resolve();
      }
      // no erep, user has some garages
      if (userGarages && !erepGarages) {
        filters.where.garageId = { inq: userGarages };
        return Promise.resolve();
      }
      // with erep, user has every garages
      if (!userGarages && erepGarages) {
        filters.where.garageId = { inq: erepGarages };
        return Promise.resolve();
      }
      // with erep, user has some garages
      if (userGarages && erepGarages) {
        const erepAndUserGarages = userGarages.filter((id) => erepGarages.indexOf(id) !== -1);
        filters.where.garageId = { inq: erepAndUserGarages };
        return Promise.resolve();
      }
    } else {
      // results with a garageId filter in url
      // garageId in url but the user doesn't own the garage
      if (userGarages && userGarages.indexOf(garageIdInRequest) === -1) {
        return Promise.reject(new Error('Not authorized to access garage'));
      }
      // garageId in url but the garage doesnt have erep
      if (erepGarages && erepGarages.indexOf(garageIdInRequest) === -1) {
        return Promise.reject(new Error('Garage has not erep'));
      }
      filters.where.garageId = garageIdInRequest;
    }
    return Promise.resolve();
  },
};
