'use strict';

const moment = require('moment');
const nunjucks = require('nunjucks');
const path = require('path');
const jsesc = require('jsesc');
const { ObjectID } = require('mongodb');
const I18nRequire = require('../i18n/i18n');

const gsClient = require('../client');
const gsLogos = require('../garage/logo');
const GarageStatus = require('../../../models/garage.status.js');
const GarageTypes = require('../../../models/garage.type.js');

// escape string for the json in our templates
const escapeJS = (s) => jsesc(s, { quotes: 'double' }).replace(/ /g, '\\u0020');

/**
 * @param  {hideDirectoryPage:Boolean, status:String} garage
 *
 * @returns {Boolean} - garageWidgetDisabled
 */
function _isGarageWidgetDisabled(data) {
  const {
    hideDirectoryPage: isHiddenNewCustomer,
    status,
  } = data;
  const isPayingCustomer = [
    GarageStatus.RUNNING_AUTO,
    GarageStatus.RUNNING_MANUAL,
    GarageStatus.EREP_ONLY,
  ].includes(status);

  return (!isPayingCustomer || isHiddenNewCustomer);
}

/**
 * Query garages PublicScore to get rating data for widgets
 * @param  {Object} app
 * @param  {[ObjectId]} garageIds
 * @param  {String} type
 *
 * @returns {{ rating:Number|null, respondentsCount:Number}}
 */
async function _getRatingData(app, garageIds, type) {
  const typeFilter = type ? { type } : {};
  const pipeline = [
    {
      $match: {
        garageId: { $in: garageIds },
        ...typeFilter,
      },
    },
    {
      $sort: { synthesizedAt: -1 },
    },
    {
      $group: {
        _id: {
          garageId: '$garageId',
          type: '$type',
        },
        rating: {
          $first: '$$ROOT.payload.rating.global',
        },
      },
    },
  ];

  const docs = await app.models.PublicScore.getMongoConnector()
    .aggregate(pipeline)
    .toArray();

  let respondentsCount = 0;
  let globalRating = 0;
  for (let index = 0; index < docs.length; index++) {
    const garageRating = docs[index].rating;
    respondentsCount += garageRating.respondentsCount;
    globalRating += garageRating.value * garageRating.respondentsCount;
  }

  const rating = (
    respondentsCount
      ? Math.round((10 * globalRating) / respondentsCount) / 10
      : null
  );

  return { rating, respondentsCount };
}

/**
 * Query garage score data for widgets
 * @param  {Object} app
 * @param  {String} slug
 * @param  {String} type
 *
 * @returns {{ disabled:Boolean, name:String, locale:String,rating:Number, respondentsCount:Number}}
 */
async function _getGarageWidgetData(app, slug, type) {
  const garage = await app.models.Garage.getMongoConnector()
    .findOne(
      { slug },
      {
        projection: {
          locale: 1,
          publicDisplayName: 1,
          hideDirectoryPage: 1,
          status: 1,
          type: 1,
          streetAddress: 1,
          city: 1,
          postalCode: 1,
          googlePlace: 1,
          logoDirectoryPage: 1,
          brandNames: 1,
        },
      },
    );
  if (!garage) {
    return;
  }

  const isWidgetDisabled = _isGarageWidgetDisabled(garage);
  //TODO: use dedicated logic for enrich script common/templates/widget/v3/enrich.js.nunjucks
  const networkTypeDisplayName = garage.type;
  const {
    streetAddress,
    city,
    postalCode,
    googlePlace,
    logoDirectoryPage,
    brandNames,
  } = garage;

  const brandLogos = logoDirectoryPage
    ? logoDirectoryPage.map(
      (logo) => gsClient.latestStaticUrl(gsLogos.getLogoPath(logo))
    )
    : brandNames.map(
      (brandLogo) => gsClient.latestStaticUrl(gsLogos.brandLogo(brandLogo))
    );

  const latitude = googlePlace && googlePlace.latitude;
  const longitude = googlePlace && googlePlace.longitude;

  const url = `${process.env.WWW_URL}/${GarageTypes.getSlug(garage.type)}/${slug}`;
  const rating = await _getRatingData(app, [garage._id], type);

  return {
    disabled: isWidgetDisabled,
    name: garage.publicDisplayName,
    locale: garage.locale,
    url,
    ...rating,
    streetAddress,
    city,
    postalCode,
    latitude,
    longitude,
    networkTypeDisplayName,
    brandLogos,
  };
}

/**
 * Query group score data for widgets
 * @param  {Object} app
 * @param  {ObjectId} groupId
 * @param  {String} type
 *
 * @returns {{ name:String, rating:Number, respondentsCount:Number}}
 */
async function _getGroupWidgetData(app, groupId, type) {
  const group = await app.models.WidgetGroup
    .getMongoConnector()
    .findOne(
      { _id: ObjectID(groupId) },
      {
        projection: {
          type: 1,
          garageIds: 1,
        },
      },
    );

  if (!group || !group.garageIds || !group.garageIds.length) {
    return;
  }

  const groupGarageObjectIds = group.garageIds.map(garageId => ObjectID(garageId));
  const garages = await app.models.Garage
    .getMongoConnector()
    .find(
      {
        _id: { $in: groupGarageObjectIds },
      },
      {
        projection: {
          hideDirectoryPage: 1,
          status: 1,
          locale: 1,
        }
      }
    )
    .toArray();

  // if at least one garage is enabled the group is considered as enabled
  // if the group is enabled we use rating from all the garages event the ones considered as disabled
  const isGroupWidgetDisabled = garages.every(_isGarageWidgetDisabled);
  const [ garage = {} ] = garages || [];
  const locale = garage.locale || 'fr';
  const rating = await _getRatingData(app, group.garageIds, type);

  return {
    disabled: isGroupWidgetDisabled,
    locale,
    ...rating,
  };
}

/**
 * Check if garage enrichScript is Enabled
 * @param  {Object} app
 * @param  {String} slug - garage slug
 *
 * @returns {Boolean} enrichScriptEnabled
 */
async function isGarageEnrichScriptEnabled(app, slug) {
  const {
    enrichScriptEnabled = false
  } = await app.models.Garage.getMongoConnector()
    .findOne(
      { slug },
      {
        projection: {
          enrichScriptEnabled: 1,
        },
      },
    ) || {};

  return enrichScriptEnabled;
}

/**
 * * Fetch widget data from bdd
 *
 * @param  {String} type - doc type : group or garage
 * @param  {ObjectId|String} slug - groupId or garage.slug
 * @param  {String} service - publicRecord type
 *
 * @returns {{locale:Boolean, name:String, rating:Number, respondentsCount:Number}}
 */
const getWidgetData = function (app, type, slug, service = null) {
  if (type === 'group') {
    return _getGroupWidgetData(app, slug, service);
  }
  return _getGarageWidgetData(app, slug, service);
};


const WidgetFactory = {
  type: 'garage',
  locale: 'fr',
  brand: 'garagescore',
  text: {
    reviews: null,
    details: null,
  },
  baseUrl: '/images/widget/',
  demoData: {
    score: 95,
    url: '#',
    rating: 9.5,
    respondentsCount: 2975,
    networkTypeDisplayName: '-',
    disabled: false,
  },
  getLanguageFromParams(language) {
    const supportedLanguage = [
      'fr',
      'en',
      'es',
    ];
    const formattedLanguage = (
      language.length > 2
        ? language.slice(0, 2)
        : language
    ).toLowerCase();
    if (supportedLanguage.includes(formattedLanguage)) {
      return formattedLanguage;
    }
    return 'fr';
},
  setLanguage({ locale, garageLocale }) {
    this.locale = this.getLanguageFromParams(locale || garageLocale);
  },
  setSynthDate({ submittedAt }) {
    /*
     * HACK: Format data according to FR locale.
     * This would probably be best using Nunjucks filters.
    */
    if (typeof submittedAt !== 'undefined') {
      this.synthesizedAt = moment(submittedAt)
        .locale('fr')
        .format('dddd D MMMM YYYY');
    }
  },
  setRating({ rating: rawRating, preview }) {
    const rating = preview ? 9.5 : rawRating;
    const isValidNumber = Number.isFinite(rating);

    if (!isValidNumber) {
      this.rating = '-';
      return;
    }
    this.rating = rating.toPrecision(2).replace('.', ',');
  },
  setBrand({ brand }) {
    if (!brand) {
      return;
    }

    const supportedBrands = [
      'garagescore',
      'custeed',
    ];
    if (supportedBrands.includes(brand)) {
      this.brand = brand;
    }
  },
  setName({ name = '' }) {
    this.name = name.replace(/\(.+/, '');
  },
  buildSvgPath() {
    const urlBrandFragment = `${this.brand}/`;
    const urlFormatFragment = `${this.format}/`;
    const urlStyleFragment = this.isTransparent ? 'transparent/' : '';
    const urlFragments = `${urlBrandFragment}${urlFormatFragment}${urlStyleFragment}`;

    const fileName = `${this.format}`;
    const urlSuffix = `${fileName}.svg`;

    return `${this.baseUrl}${urlFragments}${urlSuffix}`;
  },
  setFormat({ widgetFormat }) {
    const supportedFormats = [
      'rectangle',
      'banner',
      'vertical',
    ];

    if (widgetFormat && supportedFormats.includes(widgetFormat)) {
      this.format = widgetFormat;
    } else {
      this.format = 'vertical';
    }
  },
  setText({ respondentsCount: rawRespondentsCount, preview }) {
    const respondentsCount = String(
      preview
        ? 2975
        : (rawRespondentsCount || 0)
    );
    const { locale, type } = this;
    const i18n = new I18nRequire(`widget/${type}`, { locale });

    this.text = {
      reviews: i18n.$t('reviews', { respondentsCount }),
      detail: i18n.$t('detail'),
    };
  },
  build(params) {
    this.type = params.type;
    this.isTransparent = !(params.css.background);
    this.setBrand(params);
    this.setFormat(params);
    this.setLanguage(params);
    this.setSynthDate(params);
    this.setName(params);
    this.setRating(params);
    this.setText(params);
    this.defaultValues = params.preview
      ? {
        css: {
          ...params.css,
          background: (!this.isTransparent).toString(),
        },
        size: params.size,
        ...this.demoData,
      }
      : {
        css: {
          ...params.css,
          background: (!this.isTransparent).toString(),
        },
        size: params.size,
        score: params.score || ((params.rating || 0) * 10),
        url: params.url || '',
        rating: params.rating || '-',
        respondentsCount: params.respondentsCount || 0,
        networkTypeDisplayName: params.networkTypeDisplayName || '-',
        disabled: false,
      };
  },
  getData() {
    return {
      ...this.defaultValues,
      type: this.type,
      reviewsText: this.text.reviews,
      detailTextOne: this.text.detail[0],
      detailTextTwo: this.text.detail[1],
      svgPath: this.buildSvgPath(),
      locale: this.locale,
      synthesizedAt: this.synthesizedAt,
      frenchRating: this.rating,
      name: this.name,
      brand: this.brand,
    }
  },
};

/**
 * Return the widget html as string
 * @param  {} app
 * @param  {ObjectId|String} slug - groupId or garage.slug
 * @param  {String} type - group or garage
 * @param  {String} widgetFormat - name of the widget template to be loaded
 * @param  {{size:Number, css:Object}} renderOptions
 *
 * @returns {String} widget html
 */
async function renderWidget(
  app,
  slug,
  type,
  widgetFormat,
  renderOptions = {
    css: {},
    size: undefined,
  },
) {
  if (type !== 'group' && type !== 'garage') {
    throw new Error(`Unknown type of widget (garage||group) --> ${type}`);
  }

  const data = renderOptions.preview
    ? {}
    : await getWidgetData(app, type, slug);

  if (!data) {
    return '';
  }

  // === Nunjucks
  const widgetTemplatePath =  path.normalize(
    path.join(__dirname, '../../..', 'templates/widget/v3/')
  );
  // Configure Nunjucks
  const nunjucksEnv = nunjucks.configure(
    widgetTemplatePath,
    {
      autoescape: true,
      watch: false,
    }
  );
  nunjucksEnv.addGlobal('lib', {
    client: gsClient,
  });
  nunjucksEnv.addGlobal(
    'gaWidgetKey',
    process.env.GA_MEASUREMENT_WIDGET_ID
  );
  nunjucksEnv.addFilter('escapejs', escapeJS);
  // === Nunjucks


  if (data.disabled && !renderOptions.preview) {
    // Return html data but without the widget content ...
    return nunjucksEnv.render(
      `${widgetFormat}.nunjucks`,
      { disableWidget: true },
    );
  }


  const widget = WidgetFactory;
  const { locale, ...garageData } = data;
  const formattedData = {
    garageLocale: locale,
    ...garageData,
  };

  widget.build({
    ...formattedData,
    ...renderOptions,
    widgetFormat,
    type,
  });

  return nunjucksEnv.render(
    `${widgetFormat}.nunjucks`,
    widget.getData(),
  );
}

module.exports = {
  isGarageEnrichScriptEnabled,
  renderWidget,
};
