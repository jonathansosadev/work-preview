/* eslint-disable */

module.exports = {
  label: 'LABEL',
  before: async () => { },
  queryApollo: `mutation GarageCreate($name: String!, $brandNames: [String]!, $billingAccountId: String!, $type: String!, $group: String, $businessId: String, $googlePlaceId: String, $locale: String, $timezone: String, $zohoDealUrl: String, disableZohoUrl: Boolean, $ratingType: String, $isReverseRating: Boolean, $certificateWording: String, $sensitiveThresholdApv: Int, $sensitiveThresholdVn: Int, $sensitiveThresholdVo: Int, $link: String, $parentGarageId: String, $shareLeadTicket: Boolean, $shareLeadTicketNewVehicleSale: Boolean, $shareLeadTicketUsedVehicleSale: Boolean, $manager_firstname: String, $manager_lastname: String, $manager_job: String, $managerApv_firstname: String, $managerApv_lastname: String, $managerApv_job: String, $managerVn_firstname: String, $managerVn_lastname: String, $managerVn_job: String, $managerVo_firstname: String, $managerVo_lastname: String, $managerVo_job: String) {
    GarageCreate(name: $name,  brandNames: $brandNames,  billingAccountId: $billingAccountId,  type: $type,  group: $group,  businessId: $businessId,  googlePlaceId: $googlePlaceId,  locale: $locale,  timezone: $timezone,  zohoDealUrl: $zohoDealUrl,  disableZohoUrl: $disableZohoUrl, ratingType: $ratingType,  isReverseRating: $isReverseRating,  certificateWording: $certificateWording,  sensitiveThresholdApv: $sensitiveThresholdApv,  sensitiveThresholdVn: $sensitiveThresholdVn,  sensitiveThresholdVo: $sensitiveThresholdVo,  link: $link,  parentGarageId: $parentGarageId,  shareLeadTicket: $shareLeadTicket,  shareLeadTicketNewVehicleSale: $shareLeadTicketNewVehicleSale,  shareLeadTicketUsedVehicleSale: $shareLeadTicketUsedVehicleSale,  manager_firstname: $manager_firstname,  manager_lastname: $manager_lastname,  manager_job: $manager_job,  managerApv_firstname: $managerApv_firstname,  managerApv_lastname: $managerApv_lastname,  managerApv_job: $managerApv_job,  managerVn_firstname: $managerVn_firstname,  managerVn_lastname: $managerVn_lastname,  managerVn_job: $managerVn_job,  managerVo_firstname: $managerVo_firstname,  managerVo_lastname: $managerVo_lastname,  managerVo_job: $managerVo_job) {
      id
      type
      status
      slug
      publicDisplayName
      googlePlaceId
      locale
      timezone
      streetAddress
      city
      postalCode
      subRegion
      region
      latitude
      longitude
      brandNames
      group
      businessId
      manager {
        lastName
        firstName
        job
      }
      managerApv {
        lastName
        firstName
        job
      }
      managerVn {
        lastName
        firstName
        job
      }
      managerVo {
        lastName
        firstName
        job
      }
      thresholds {
        alertSensitiveThreshold {
          maintenance
          sale_new
          sale_used
        }
      }
      links {
        name
        url
      }
      parent {
        garageId
        shareLeadTicket {
          enabled
          NewVehicleSale
          UsedVehicleSale
        }
      }
    }
  }`,
  variablesApollo: {
    name: 'Garage de Saturne',
    group: 'Planet Otto',
    businessId: '12345678912345',
    googlePlaceId: 'ChIJo4xKCOPv6EcRbpK-g42aWyE',
    locale: 'fr_FR',
    timezone: 'Europe/Paris',
    brandNames: ['Mercedes-Benz'],
    manager_lastname: 'Ken',
    manager_firstname: 'Samaras',
    manager_job: 'MC',
    managerApv_lastname: '',
    managerApv_firstname: '',
    managerApv_job: '',
    managerVn_lastname: '',
    managerVn_firstname: '',
    managerVn_job: '',
    managerVo_lastname: '',
    managerVo_firstname: '',
    managerVo_job: '',
    sensitiveThresholdApv: 6,
    sensitiveThresholdVo: 6,
    sensitiveThresholdVn: 6,
    link: 'https://genius.com/Nekfeu-saturne-lyrics',
    zohoDealUrl: 'Je veux faire le tour de ma planète comme les anneaux de Saturne. Uefken',
    disableZohoUrl: false,
    type: 'Dealership',
    ratingType: 'stars',
    isReverseRating: false,
    certificateWording: 'appointment',
    parentGarageId: '',
    shareLeadTicket: false,
    shareLeadTicketNewVehicleSale: false,
    shareLeadTicketUsedVehicleSale: false,
    billingAccountId: '5b10f88a984d6300139f7426',
  },
  legacyQuery: `mutation createGarage($input: InputCreateGarage) {
    createGarage(input: $input) {
      id
      type
      status
      slug
      publicDisplayName
      googlePlaceId
      locale
      timezone
      streetAddress
      city
      postalCode
      subRegion
      region
      latitude
      longitude
      brandNames
      group
      businessId
      manager {
        lastName
        firstName
        job
      }
      managerApv {
        lastName
        firstName
        job
      }
      managerVn {
        lastName
        firstName
        job
      }
      managerVo {
        lastName
        firstName
        job
      }
      thresholds {
        alertSensitiveThreshold {
          maintenance
          sale_new
          sale_used
        }
      }
      links {
        name
        url
      }
      parent {
        garageId
        shareLeadTicket {
          enabled
          NewVehicleSale
          UsedVehicleSale
        }
      }
      leadsVisibleToEveryone
    }
  }`,
  variablesLegacy: {
    input: {
      name: 'Garage de Saturne',
      group: 'Planet Otto',
      businessId: '12345678912345',
      googlePlaceId: 'ChIJo4xKCOPv6EcRbpK-g42aWyE',
      locale: 'fr_FR',
      timezone: 'Europe/Paris',
      brandNames: ['Mercedes-Benz'],
      manager: { lastname: 'Ken', firstname: 'Samaras', job: 'MC' },
      managerApv: { lastname: '', firstname: '', job: '' },
      managerVn: { lastname: '', firstname: '', job: '' },
      managerVo: { lastname: '', firstname: '', job: '' },
      apv: 6,
      vn: 6,
      vo: 6,
      link: 'https://genius.com/Nekfeu-saturne-lyrics',
      zohoDealUrl: 'Je veux faire le tour de ma planète comme les anneaux de Saturne. Uefken',
      disableZohoUrl: false,
      type: 'Dealership',
      ratingType: 'stars',
      isReverseRating: false,
      certificateWording: 'appointment',
      parentGarageId: '',
      shareLeadTicket: false,
      shareLeadTicketNewVehicleSale: false,
      shareLeadTicketUsedVehicleSale: false,
      billingAccountId: '5b10f88a984d6300139f7426',
      leadsVisibleToEveryone: false
    },
  },
  getLegacyResults: (data) => {
    const d = JSON.parse(JSON.stringify(data));
    // Because the slug will contain an ever changig garageId starting from the second time launching
    delete d.createGarage.slug;
    delete d.createGarage.id;
    return JSON.stringify(d.createGarage, null, 2);
  },
  getResults: (data) => {
    const d = JSON.parse(JSON.stringify(data));
    // Because the slug will contain an ever changig garageId starting from the second time launching
    delete d.GarageCreate.slug;
    delete d.GarageCreate.id;
    return JSON.stringify(d.GarageCreate, null, 2);
  },
  expected: {
    type: 'Dealership',
    status: 'ToCreate',
    publicDisplayName: 'Garage de Saturne',
    googlePlaceId: 'ChIJo4xKCOPv6EcRbpK-g42aWyE',
    locale: 'fr_FR',
    timezone: 'Europe/Paris',
    streetAddress: '10 Rue Jean de la Fontaine',
    city: 'Rocourt-Saint-Martin',
    postalCode: '02210',
    subRegion: 'Aisne',
    region: 'Hauts-de-France',
    latitude: 49.1501945,
    longitude: 3.3878074,
    brandNames: ['Mercedes-Benz'],
    group: 'Planet Otto',
    businessId: '12345678912345',
    manager: {
      lastName: 'Ken',
      firstName: 'Samaras',
      job: 'MC',
    },
    managerApv: {
      lastName: '',
      firstName: '',
      job: '',
    },
    managerVn: {
      lastName: '',
      firstName: '',
      job: '',
    },
    managerVo: {
      lastName: '',
      firstName: '',
      job: '',
    },
    thresholds: {
      alertSensitiveThreshold: {
        maintenance: 6,
        sale_new: 6,
        sale_used: 6,
      },
    },
    links: [
      {
        name: 'appointment',
        url: 'https://genius.com/Nekfeu-saturne-lyrics',
      },
    ],
    parent: {
      garageId: '',
      shareLeadTicket: {
        enabled: false,
        NewVehicleSale: false,
        UsedVehicleSale: false,
      },
    },
  },
};
