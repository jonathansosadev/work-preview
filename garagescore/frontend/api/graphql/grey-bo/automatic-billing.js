const partialGarageFragment = `
  id
  publicDisplayName
  slug
  type
  status
  bizDevId
  performerId
  subscriptions {
    active
    Maintenance {
      enabled
    }
    NewVehicleSale {
      enabled
    }
    UsedVehicleSale {
      enabled
    }
    Lead {
      enabled
    }
    EReputation {
      enabled
    }
    VehicleInspection {
      enabled
    }
    Analytics {
      enabled
    }
    Coaching {
      enabled
    }
    Connect {
      enabled
    }
    CrossLeads {
      enabled
    }
    Automation {
      enabled
    }
    AutomationApv {
      enabled
    }
    AutomationVn {
      enabled
    }
    AutomationVo {
      enabled
    }
  }
`

const partialBillingAccountFragment = `
  id
  name
  billingDate
  dateNextBilling
  companyName
  email
  billingType
  garageIds
`

export const getBillingAccountsQuery = () => {
  return {
    name: 'billingAccountGetBillingAccounts',
    args: {},
    fields: `
      ${partialBillingAccountFragment}
    `,
  };
};

export const getGaragesQuery = () => {
  return {
    name: 'garageGetGarages',
    args: {},
    fields: `
      ${partialGarageFragment}
      billingAccount {
        id
        name
      }
    `,
  };
};

export const subscriptionsFragment = `
  priceValidated
  Maintenance {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  NewVehicleSale {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  UsedVehicleSale {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  Lead {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  EReputation {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  VehicleInspection {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  Analytics {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  Coaching {
    enabled
    price
    churn {
      enabled
      delta
    }
  }
  Connect {
    enabled
    price
  }
  CrossLeads {
    enabled
    price
    included
    unitPrice
    restrictMobile
    minutePrice
    churn {
      enabled
      delta
    }
  }
  Automation {
    enabled
    price
    included
    every
    churn {
      enabled
      delta
    }
  }
  active
  dateStart
  dateEnd
  isFullChurn
  churnEffectiveDate
  setup {
    enabled
    price
    monthOffset
    billDate
    alreadyBilled
  }
  users {
    included
    maximumTotalPriceForUsers
    price
  }
  contacts {
    bundle
    included
    every
    price
  }
  AutomationApv {
    enabled
  }
  AutomationVn {
    enabled
  }
  AutomationVo {
    enabled
  }
`

const fullGarageFragment = `
  id
  type
  publicDisplayName
  slug
  status
  bizDevId
  performerId
  annexGarageId
  googlePlaceId
  businessId
  zohoDealUrl
  disableZohoUrl
  locale
  additionalLocales
  timezone
  group
  ratingType
  isReverseRating
  brandNames
  certificateWording
  externalId
  crossLeadsSourcesEnabled
  allowReviewCreationFromContactTicket
  enableCrossLeadsSelfAssignCallAlert
  leadsVisibleToEveryone
  links {
    name
    url
  }
  surveySignature {
    defaultSignature {
      lastName
      firstName
      job
    }
  }
  thresholds {
    alertSensitiveThreshold {
      maintenance
      sale_new
      sale_used
      vehicle_inspection
    }
  }
  parent {
    garageId
    shareLeadTicket {
      enabled
      NewVehicleSale
      UsedVehicleSale
    }
  }
  subscriptions {
   ${subscriptionsFragment}
  }
  ticketsConfiguration {
    Unsatisfied_Maintenance
    Unsatisfied_NewVehicleSale
    Unsatisfied_UsedVehicleSale
    Lead_Maintenance
    Lead_NewVehicleSale
    Lead_UsedVehicleSale
    VehicleInspection
  }
`

const fullBillingAccountFragment = `
  id
  name
  email
  billingDate
  dateNextBilling
  goCardLessSetup
  billingType
  accountingId
  companyName
  address
  postalCode
  city
  country
  vfClientId
  technicalContact
  accountingContact
  RGPDContact
  externalId
  mandateId
  customerId
  garageIds
  createdAt
  updatedAt
  sentLastAt
`

export const getGarageQuery = (garageId) => {
  return {
    name: 'garageGetGarage',
    args: {
      garageId,
    },
    fields: `
      ${fullGarageFragment}
    `,
  };
};

export const getBillingAccountQuery = (billingAccountId) => {
  return {
    name: 'billingAccountGetBillingAccount',
    args: {
      billingAccountId,
    },
    fields: `
      ${fullBillingAccountFragment}
      garages {
        ${fullGarageFragment}
      }
      invoices {
        name
        path
      }
  `,
  };
};
