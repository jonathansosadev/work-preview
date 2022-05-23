import _ from 'lodash'
import moment from 'moment'
import 'moment-timezone';
import { KpiPeriods } from "./kpi-periods";

const timezone = 'Europe/Paris'
const locale = 'fr'
const exogenousPrefix = 'EXOGENOUS-'
moment.locale(locale)
moment.tz(timezone)
// Array.prototype.includes simi-polyfill https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Array/includes
function _arrayIncludes(array, searchElement) {
  const O = Object(array)
  const len = parseInt(O.length, 10) || 0
  if (len === 0) {
    return false
  }
  const n = parseInt(searchElement, 10) || 0
  let k
  if (n >= 0) {
    k = n
  } else {
    k = len + n
    if (k < 0) {
      k = 0
    }
  }
  let currentElement
  while (k < len) {
    currentElement = O[k]
    if (
      searchElement === currentElement ||
      (searchElement !== searchElement && currentElement !== currentElement)
    ) {
      // eslint-disable-line
      return true
    }
    k++
  }
  return false
}

function _cleanExogenousPrefix(periodId) {
  if (typeof periodId === 'string') {
    return periodId.replace(exogenousPrefix, '')
  }
  return periodId
}

const GarageHistoryPeriod = {
  isSupported(type) {
    return Object.values(GarageHistoryPeriod).indexOf(type) !== -1
  },
  getDisplayableDate(report) {
    if (!report) {
      return '-'
    }
    if (
      report.reportConfigId === 'weekly' &&
      report.minDate &&
      report.maxDate
    ) {
      return `du ${moment(report.minDate).format('DD MMMM YYYY')} au ${moment(
        report.maxDate
      ).format('DD MMMM YYYY')}`
    }
    if (!report.period) {
      return '*'
    }
    const period = report.period
    const regexKeys = GarageHistoryPeriod.getRegexKeys()
    const that = GarageHistoryPeriod
    const usedRegexKeyPos = _.findIndex(regexKeys, (o) => period.match(that[o]))
    if (usedRegexKeyPos === -1) {
      return period
    }
    const usedRegexKey = regexKeys[usedRegexKeyPos]
    const displayKey = usedRegexKey.replace('_REGEX', '_DISPLAY')
    const formatKey = usedRegexKey.replace('_REGEX', '_FORMAT')
    const usedFormat = GarageHistoryPeriod[formatKey]
    if (
      usedFormat &&
      GarageHistoryPeriod[displayKey] &&
      GarageHistoryPeriod[formatKey]
    ) {
      return moment(period, GarageHistoryPeriod[formatKey]).format(
        GarageHistoryPeriod[displayKey]
      )
    }
    return period
  },
  getFormatKeys() {
    const values = []
    for (let i = 0; i < Object.keys(GarageHistoryPeriod).length; i++) {
      const p = Object.keys(GarageHistoryPeriod)[i]
      if (typeof GarageHistoryPeriod[p] !== 'function' && p.match(/_FORMAT$/)) {
        values.push(p)
      }
    }
    return values
  },
  getRegexKeys() {
    const values = []
    for (let i = 0; i < Object.keys(GarageHistoryPeriod).length; i++) {
      const p = Object.keys(GarageHistoryPeriod)[i]
      if (typeof GarageHistoryPeriod[p] !== 'function' && p.match(/_REGEX$/)) {
        values.push(p)
      }
    }
    return values
  },
  values() {
    const allValues = Object.values(GarageHistoryPeriod)
    const values = []
    allValues.forEach((val) => {
      if (typeof val !== 'function') {
        values.push(val)
      }
    })
    return values
  },
  /**
   *
   * @param user User model instance
   * @param garageIds Array of garageId Strings (optional)
   * @param callback
   */
  async getCockpitAvailablePeriodsForUser(app, user, garageIds) {
    if (!user) {
      throw new Error('NO USER GIVEN: getCockpitAvailablePeriodsForUser');
    }

    const $match = garageIds ? [{ _id: { $in: garageIds } }] : null;
    const garages = await getUserGarages(app, user.getId(), { dataImportStartedAt: true, createdAt: true }, $match);
    garages.forEach((garage) => {
      garage.getDataImportStartedAt = app.models.Garage.getDataImportStartedAt.bind(garage);
    });

    if (garages.length === 0) {
      return GarageHistoryPeriod.getCockpitAvailablePeriods(new Date('1970-01-01'));
    }
    if (garages.length === 1) {
      return GarageHistoryPeriod.getCockpitAvailablePeriods(garages[0].getDataImportStartedAt());
    }
    const refDate = garages
      .reduce((garageA, garageB) => (
        moment(garageA.getDataImportStartedAt()).isBefore(garageB.getDataImportStartedAt())
          ? garageA
          : garageB
      ))
      .getDataImportStartedAt();

    return GarageHistoryPeriod.getCockpitAvailablePeriods(refDate);
  },
  getCockpitAvailablePeriods: function getCockpitAvailablePeriods(
    refDate,
    actualTime
  ) {
    let now = actualTime

    if (now === undefined) {
      // si on a pas passé en param actualTime
      now = moment()
    } else {
      now = moment(now)
    }

    const formatPeriod = function(n, key, clean) {
      // today factory
      let factory = 0
      if (key == 'quarters_in_the_past') {
        factory = 3
      } else if (key == 'months_in_the_past') {
        factory = 1
      }

      let format = 'YYYY-MM-DD'
      if (clean) {
        format = 'YYYY-MM-01'
      }

      const date = moment(now)
        .subtract(n * factory, 'months')
        .format(format)
      return date
    }

    const allPeriods = [
      {
        id: GarageHistoryPeriod.LAST_QUARTER,
        label: 'des 90 derniers jours',
        display: '90 derniers jours glissants',
        selector: {
          from: formatPeriod(1, 'quarters_in_the_past'),
          to: formatPeriod('now')
        },
        groupId: 'others',
        minDate: GarageHistoryPeriod.getPeriodMinDate(
          GarageHistoryPeriod.LAST_QUARTER
        ),
        maxDate: GarageHistoryPeriod.getPeriodMaxDate(
          GarageHistoryPeriod.LAST_QUARTER
        )
      },
      {
        id: GarageHistoryPeriod.CURRENT_YEAR,
        label: "de l'année en cours",
        display: 'Année en cours',
        selector: {
          from: formatPeriod(4, 'quarters_in_the_past'),
          to: formatPeriod('now')
        },
        groupId: 'others',
        minDate: GarageHistoryPeriod.getPeriodMinDate(
          GarageHistoryPeriod.CURRENT_YEAR
        ),
        maxDate: GarageHistoryPeriod.getPeriodMaxDate(
          GarageHistoryPeriod.CURRENT_YEAR
        )
      },
      {
        id: GarageHistoryPeriod.ALL_HISTORY,
        label: "de tout l'historique",
        display: "Tout l'historique",
        selector: { from: 'no_from_date', to: 'no_to_date' },
        groupId: 'others',
        minDate: GarageHistoryPeriod.getPeriodMinDate(
          GarageHistoryPeriod.ALL_HISTORY
        ),
        maxDate: GarageHistoryPeriod.getPeriodMaxDate(
          GarageHistoryPeriod.ALL_HISTORY
        )
      }
    ]
    if (!refDate || moment(refDate).year() <= now.year() - 1) {
      // si le garage a été créé y'a+ 1an
      allPeriods.push({
        // on affiche l'année derniere
        id: `${now.year() - 1}`,
        label: "de l'année dernière",
        display: 'Année dernière',
        selector: {
          from: formatPeriod(8, 'quarters_in_the_past'),
          to: formatPeriod(4, 'quarters_in_the_past')
        },
        groupId: 'others',
        minDate: GarageHistoryPeriod.getPeriodMinDate(now.year() - 1),
        maxDate: GarageHistoryPeriod.getPeriodMaxDate(now.year() - 1)
      })
    }
    for (let i = 1; i < 7; i++) {
      const month = moment(now)
        .subtract(i, 'months')
        .subtract(9, 'days')
      const periodDef = {
        id: month.format(GarageHistoryPeriod.MONTHLY_FORMAT),
        label: `du mois ${month.format(GarageHistoryPeriod.MONTHLY_DISPLAY)}`,
        display: _.capitalize(
          month.format(GarageHistoryPeriod.MONTHLY_DISPLAY)
        ),
        selector: {
          from: formatPeriod(i, 'months_in_the_past', true),
          to: formatPeriod(i - 1, 'months_in_the_past', true)
        },
        groupId: 'monthly',
        minDate: GarageHistoryPeriod.getPeriodMinDate(
          month.format(GarageHistoryPeriod.MONTHLY_FORMAT)
        ),
        maxDate: GarageHistoryPeriod.getPeriodMaxDate(
          month.format(GarageHistoryPeriod.MONTHLY_FORMAT)
        )
      }
      if (
        (refDate &&
          moment(GarageHistoryPeriod.getPeriodMaxDate(periodDef.id)).isAfter(
            refDate
          )) ||
        !refDate
      ) {
        allPeriods.push(periodDef)
      }
    }
    for (let j = 1; j < 5; j++) {
      const quarter = moment(now)
        .subtract(j, 'quarters')
        .subtract(10, 'days')
      const periodDef2 = {
        id: quarter.format(GarageHistoryPeriod.QUARTER_FORMAT),
        label: `du trimestre ${quarter.format(
          GarageHistoryPeriod.QUARTER_DISPLAY
        )}`,
        display: `Trimestre ${quarter.format(
          GarageHistoryPeriod.QUARTER_DISPLAY
        )}`,
        selector: {
          from: formatPeriod(j, 'quarters_in_the_past', true),
          to: formatPeriod(j - 1, 'quarters_in_the_past', true)
        },
        groupId: 'others',
        minDate: GarageHistoryPeriod.getPeriodMinDate(
          quarter.format(GarageHistoryPeriod.QUARTER_FORMAT)
        ),
        maxDate: GarageHistoryPeriod.getPeriodMaxDate(
          quarter.format(GarageHistoryPeriod.QUARTER_FORMAT)
        )
      }
      if (
        (refDate &&
          moment(GarageHistoryPeriod.getPeriodMaxDate(periodDef2.id)).isAfter(
            refDate
          )) ||
        !refDate
      ) {
        allPeriods.push(periodDef2)
      }
    }
    return allPeriods
  },
  getPeriodMaxDate(periodIdRaw) {
    let periodId = _cleanExogenousPrefix(periodIdRaw)

    switch (periodId) {
      case GarageHistoryPeriod.ALL_HISTORY:
      case GarageHistoryPeriod.LEAD_ALL_HISTORY:
      case GarageHistoryPeriod.UNSATISFIED_ALL_HISTORY:
        return moment(2147483647000, 'x').toDate()
      case GarageHistoryPeriod.CURRENT_YEAR:
        return moment('12-31 23:59:59.999', 'MM-DD HH:mm:ss.SSS').toDate()
      case GarageHistoryPeriod.LAST_QUARTER:
        return moment().toDate()
      case GarageHistoryPeriod.EXOGENOUS_LAST_QUARTER:
        return moment().toDate()
      default:
        periodId = periodId.toString() // eslint-disable-line no-param-reassign
        if (periodId.match(GarageHistoryPeriod.DAILY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.DAILY_FORMAT)
            .add(1, 'day')
            .subtract(1, 'millisecond')
            .toDate()
        }
        if (periodId.match(GarageHistoryPeriod.WEEKLY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.WEEKLY_FORMAT)
            .add(7, 'day')
            .subtract(1, 'millisecond')
            .toDate()
        }
        if (periodId.match(GarageHistoryPeriod.MONTHLY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.MONTHLY_FORMAT)
            .add(1, 'month')
            .subtract(1, 'millisecond')
            .toDate()
        }
        if (periodId.match(GarageHistoryPeriod.QUARTER_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.QUARTER_FORMAT)
            .add(3, 'months')
            .subtract(1, 'millisecond')
            .toDate()
        }
        if (periodId.match(GarageHistoryPeriod.YEARLY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.YEARLY_FORMAT)
            .add(1, 'year')
            .subtract(1, 'millisecond')
            .toDate()
        }
        throw new Error(`Unsupported Period Id ${periodId}`)
    }
  },
  /**
   * this must return a field saved on the Data model
   * @param periodIdRaw
   * @returns String
   */
  getReferenceField(periodIdRaw) {
    let periodId = _cleanExogenousPrefix(periodIdRaw)

    periodId = periodId.toString() // eslint-disable-line no-param-reassign
    if (
      periodId.match(GarageHistoryPeriod.DAILY_REGEX) ||
      periodId.match(GarageHistoryPeriod.WEEKLY_REGEX)
    ) {
      return 'review.createdAt'
    }
    return 'service.providedAt'
  },
  getPeriodMinDate(periodIdRaw) {
    let periodId = _cleanExogenousPrefix(periodIdRaw)

    switch (periodId) {
      case GarageHistoryPeriod.ALL_HISTORY:
      case GarageHistoryPeriod.LEAD_ALL_HISTORY:
      case GarageHistoryPeriod.UNSATISFIED_ALL_HISTORY:
        return moment(0, 'x').toDate()
      case GarageHistoryPeriod.CURRENT_YEAR:
        return moment('00:00:00', 'hh:mm:ss')
          .dayOfYear(1)
          .toDate()
      case GarageHistoryPeriod.LAST_QUARTER:
        return moment()
          .subtract(90, 'days')
          .toDate()
      default:
        periodId = periodId.toString() // eslint-disable-line no-param-reassign
        if (periodId.match(GarageHistoryPeriod.DAILY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.DAILY_FORMAT).toDate()
        }
        if (periodId.match(GarageHistoryPeriod.WEEKLY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.WEEKLY_FORMAT).toDate()
        }
        if (periodId.match(GarageHistoryPeriod.MONTHLY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.MONTHLY_FORMAT)
            .date(1)
            .toDate()
        }
        if (periodId.match(GarageHistoryPeriod.QUARTER_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.QUARTER_FORMAT).toDate()
        }
        if (periodId.match(GarageHistoryPeriod.YEARLY_REGEX)) {
          return moment(periodId, GarageHistoryPeriod.YEARLY_FORMAT)
            .month(0)
            .date(1)
            .toDate()
        }
        throw new Error(`Unsupported Period Id ${periodId}`)
    }
  },
  tokenizeLastMonth(referenceDate) {
    return moment(referenceDate)
      .subtract(1, 'month')
      .format(GarageHistoryPeriod.MONTHLY_FORMAT)
  },
  tokenizeLastWeek(referenceDate) {
    return moment(referenceDate)
      .day(-6)
      .format(GarageHistoryPeriod.WEEKLY_FORMAT)
  },
  tokenizeLastday(referenceDate) {
    return moment(referenceDate)
      .subtract(1, 'day')
      .format(GarageHistoryPeriod.DAILY_FORMAT)
  },
  tokenizeLastQuarter(referenceDate) {
    return moment(referenceDate)
      .subtract(1, 'quarter')
      .format(GarageHistoryPeriod.QUARTER_FORMAT)
  },
  isValidPeriod(periodIdRaw) {
    let periodId = _cleanExogenousPrefix(periodIdRaw)

    if (!periodId) {
      return false
    }
    switch (periodId) {
      case GarageHistoryPeriod.ALL_HISTORY:
      case GarageHistoryPeriod.LEAD_ALL_HISTORY:
      case GarageHistoryPeriod.UNSATISFIED_ALL_HISTORY:
      case GarageHistoryPeriod.CURRENT_YEAR:
      case GarageHistoryPeriod.LAST_QUARTER:
        return true
      default:
        periodId = periodId.toString() // eslint-disable-line no-param-reassign
        return !!(
          periodId.match(GarageHistoryPeriod.DAILY_REGEX) ||
          periodId.match(GarageHistoryPeriod.WEEKLY_REGEX) ||
          periodId.match(GarageHistoryPeriod.MONTHLY_REGEX) ||
          periodId.match(GarageHistoryPeriod.QUARTER_REGEX) ||
          periodId.match(GarageHistoryPeriod.YEARLY_REGEX)
        )
    }
  },
  needDetailedHistory(periodIdRaw) {
    let periodId = _cleanExogenousPrefix(periodIdRaw)

    if (!periodId) {
      return false
    }
    periodId = periodId.toString() // eslint-disable-line no-param-reassign
    return (
      periodId.match(GarageHistoryPeriod.DAILY_REGEX) ||
      periodId.match(GarageHistoryPeriod.WEEKLY_REGEX) ||
      periodId.match(GarageHistoryPeriod.MONTHLY_REGEX)
    )
  },
  fromCockpitPeriodToExogenousPeriod(periodId) {
    if (!periodId) {
      return false
    }
    return `${exogenousPrefix}${periodId}`
  },
  /* receive 'YYYY-[month]MM' send back 'YYYYMM' */
  fromKpiMonthPeriodToGhMonthPeriod(period) {
    const refDate = moment(period, KpiPeriods.MONTHLY_FORMAT);
    return refDate.format(GarageHistoryPeriod.MONTHLY_FORMAT);
  },
  YEARLY_FORMAT: 'YYYY',
  YEARLY_REGEX: /^\d\d\d\d$/,
  YEARLY_DISPLAY: 'YYYY',
  QUARTER_FORMAT: 'YYYY-[quarter]Q',
  QUARTER_REGEX: /^\d\d\d\d-quarter\d$/,
  QUARTER_DISPLAY: '[T]Q YYYY',
  MONTHLY_FORMAT: 'YYYY-[month]MM', // values will be like 2016-month08
  MONTHLY_REGEX: /^\d\d\d\d-month\d\d$/, // values will be like 2016-month08
  MONTHLY_DISPLAY: 'MMMM YYYY',
  WEEKLY_FORMAT: 'YYYY-[week]w', // values will be like 2016-week26
  WEEKLY_REGEX: /^\d\d\d\d-week\d{1,2}$/, // values will be like 2016-week26
  WEEKLY_DISPLAY: '[semaine] w YYYY',
  DAILY_FORMAT: 'YYYY-MM-DD', // values will be like 2016-05-14
  DAILY_REGEX: /^\d\d\d\d-\d\d-\d\d$/, // values will be like 2016-05-14
  DAILY_DISPLAY: 'DD MMMM YYYY',
  LAST_QUARTER: 'lastQuarter',
  CURRENT_YEAR: 'CURRENT_YEAR',
  ALL_HISTORY: 'ALL_HISTORY',
  LEAD_ALL_HISTORY: 'LEAD_ALL_HISTORY',
  UNSATISFIED_ALL_HISTORY: 'UNSATISFIED_ALL_HISTORY'
}

export { GarageHistoryPeriod }
