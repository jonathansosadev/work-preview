const { ServiceMiddleMans, ServiceCategories } = require('../../frontend/utils/enumV2');

const basicData = {
  type: 'Maintenance',
  garageType: 'Dealership',
  shouldSurfaceInStatistics: true,
  service: {
    isQuote: null,
    providedAt: new Date(),
    frontDeskUserName: 'UNDEFINED',
  },
  customer: {
    contact: {
      email: {
        value: 'l678ru1ua2000@ubeahsu4k.com',
        original: 'l678ru1ua2000@ubeahsu4k.com',
        isSyntaxOK: true,
        isEmpty: false,
      },
      mobilePhone: {
        value: '+33619983383',
        original: '+33619983383',
        isSyntaxOK: true,
        isEmpty: false,
      },
    },
    gender: {
      isEmpty: true,
    },
    title: {
      isEmpty: true,
    },
    firstName: {
      value: 'Catelyn',
      original: 'Catelyn',
      isSyntaxOK: true,
      isEmpty: false,
    },
    lastName: {
      value: 'Greyjoy',
      original: 'Greyjoy',
      isSyntaxOK: true,
      isEmpty: false,
    },
    fullName: {
      value: 'Catelyn Greyjoy',
      original: 'Catelyn Greyjoy',
      isSyntaxOK: true,
      isEmpty: false,
    },
    street: {
      value: '8 Rue Stark',
      original: '8 Rue Stark',
      isSyntaxOK: true,
      isEmpty: false,
    },
    postalCode: {
      value: '96250',
      original: '96250',
      isSyntaxOK: true,
      isEmpty: false,
    },
    city: {
      value: 'Springfield',
      original: 'Springfield',
      isSyntaxOK: true,
      isEmpty: false,
    },
    countryCode: {
      value: 'FR',
      original: 'FR',
      isSyntaxOK: true,
      isEmpty: false,
    },
    rgpd: {
      optOutMailing: {
        isEmpty: true,
      },
      optOutSMS: {
        isEmpty: true,
      },
    },
  },
  vehicle: {
    isRevised: false,
    isValidated: false,
    make: {
      value: 'Volkswagen',
      original: 'Volkswagen',
      isSyntaxOK: true,
      isEmpty: false,
    },
    model: {
      value: 'Polo',
      original: 'Polo',
      isSyntaxOK: true,
      isEmpty: false,
    },
    mileage: {
      isEmpty: true,
    },
    plate: {
      isEmpty: true,
    },
    vin: {
      isEmpty: true,
    },
    countryCode: {
      isEmpty: true,
    },
    registrationDate: {
      isEmpty: true,
    },
  },
  review: {
    createdAt: new Date(),
    rating: {
      value: 10,
    },
  },
  survey: {
    acceptNewResponses: false,
    lastRespondedAt: new Date(),
    firstRespondedAt: new Date(),
    progress: {
      isComplete: true,
      pageNumber: 5,
      pageCount: 5,
    },
    urls: {
      base: 'http://localhost:3000/s/7b07173e188ea791b5de151d6',
      baseShort: 'http://localhost:3000/y3VVWxKcl',
      mobileLanding: 'http://localhost:3000/m/7b07173e188ea791b5de151d6',
      unsatisfiedLanding: 'http://localhost:3000/u/7b07173e188ea791b5de151d6',
    },
    type: 'Maintenance',
    sendAt: '2022-02-18T16:02:52.107Z',
  },
  campaign: {
    campaignId: '620fc32b15138034ccf1219a',
    status: 'Running',
    importedAt: '2022-02-18T16:02:51.984Z',
    contactStatus: {
      hasBeenContactedByPhone: false,
      hasBeenContactedByEmail: true,
      hasOriginalBeenContactedByPhone: false,
      hasOriginalBeenContactedByEmail: false,
      status: 'Received',
      phoneStatus: 'Valid',
      emailStatus: 'Valid',
      previouslyContactedByPhone: false,
      previouslyContactedByEmail: false,
      previouslyDroppedEmail: false,
      previouslyDroppedPhone: false,
      previouslyUnsubscribedByEmail: false,
      previouslyUnsubscribedByPhone: false,
      previouslyComplainedByEmail: false,
    },
    contactScenario: {
      firstContactedAt: '2022-02-18T16:02:52.126Z',
      nextCampaignReContactDay: null,
      nextCampaignContact: null,
      nextCampaignContactDay: null,
      lastCampaignContactSent: 'maintenance_email_thanks_1_make',
      lastCampaignContactSentAt: '2022-02-18T16:02:52.337Z',
      nextCheckSurveyUpdatesDecaminute: null,
      firstContactByEmailDay: 19041,
      firstContactByPhoneDay: 19041,
      nextCampaignContactEvent: 'CONTACT_SENT',
      nextCampaignContactAt: '1970-01-01T00:00:00.000Z',
    },
  },
  source: {
    sourceId: '620fc32b15138034ccf12194',
    importedAt: '2022-02-18T16:02:51.934Z',
    raw: {
      index: 0,
      cells: {
        dateinter: '18/02/2022',
        genre: 'F',
        fullName: 'Catelyn Greyjoy',
        firstName: 'Catelyn',
        lastName: 'Greyjoy',
        email: 'l678ru1ua2000@ubeahsu4k.com',
        mobilePhone: '0033619983383',
        ville: 'Springfield',
        rue: '8 Rue Stark',
        cp: '96250',
        marque: 'VOLKSWAGEN',
        modele: 'Polo',
      },
    },
    type: 'DataFile',
  },
  alert: {
    checkAlertHour: 457001,
  },
};

function getDataWithRating(garageId, rating) {
  return { ...basicData, garageId, review: { rating: { value: rating } } };
}

function getDataWithServiceMiddleMans(garageId, services = []) {
  const res = { ...basicData, garageId };
  res.service.middleMans = [];
  services.forEach((service) => {
    if (ServiceMiddleMans.hasValue(service)) {
      res.service.middleMans.push(service);
    }
  });
  return res;
}

function getDataWithServiceCategories(garageId, services = []) {
  const res = { ...basicData, garageId };
  res.service.categories = [];
  services.forEach((service) => {
    if (ServiceCategories.hasValue(service)) {
      res.service.categories.push(service);
    }
  });
  return res;
}

module.exports = {
  basicData,
  getDataWithRating,
  getDataWithServiceMiddleMans,
  getDataWithServiceCategories,
};
