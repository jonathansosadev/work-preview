export default [{
    name: 'Agent / Moto',
    setup: {
      enabled: true,
      price: 200.00,
      monthOffset: 1,
      billDate: '',
      alreadyBilled: false
    },
    Maintenance: {
      enabled: true,
      price: 78.00
    },
    NewVehicleSale: {
      enabled: true,
      price: 0.00
    },
    UsedVehicleSale: {
      enabled: true,
      price: 0.00
    },
    Lead: {
      enabled: true,
      price: 39.00
    },
    EReputation: {
      enabled: true,
      price: 20.00
    },
    Analytics: {
      enabled: true,
      price: 0.00
    },
    Coaching: {
      enabled: true,
      price: 0.00
    },
    Connect: {
      enabled: true,
      price: 0.00
    },
    users: {
      included: 2,
      price: 3.00
    },
    contacts: {
      bundle: false,
      every: 100,
      included: 0,
      price: 0.20
    },
    CrossLeads: {
      enabled: true,
      price: 42.00,
      included: 2,
      unitPrice : 19.00,
      restrictMobile: false,
      minutePrice: 0.15
    },
    Automation: {
      enabled: true,
      price: 69.00,
      included: 0,
      every: 0.2
    },
    priceValidated: true
  },
  {
    name: 'Concession auto',
    setup: {
      enabled: true,
      price: 800.00,
      monthOffset: 1,
      billDate: '',
      alreadyBilled: false
    },
    Maintenance: {
      enabled: true,
      price: 138.00
    },
    NewVehicleSale: {
      enabled: true,
      price: 0
    },
    UsedVehicleSale: {
      enabled: true,
      price: 0
    },
    Lead: {
      enabled: true,
      price: 49.00
    },
    EReputation: {
      enabled: true,
      price: 20.00
    },
    Analytics: {
      enabled: true,
      price: 0.00
    },
    Coaching: {
      enabled: true,
      price: 0.00
    },
    Connect: {
      enabled: true,
      price: 0.00
    },
    users: {
      included: 3,
      price: 3.00
    },
    contacts: {
      bundle: false,
      every: 100,
      included: 0,
      price: 0.20
    },
    CrossLeads: {
      enabled: true,
      price: 69,
      included: 2,
      unitPrice : 19,
      restrictMobile: false,
      minutePrice: 0.15
    },
    Automation: {
      enabled: true,
      price: 99,
      included: 0,
      every: 0.2
    },
    priceValidated: true
  }, {
    name: 'Annexe',
    setup: {
      enabled: true,
      price: 800.00,
      monthOffset: 1,
      billDate: '',
      alreadyBilled: false
    },
    Maintenance: {
      enabled: true,
      price: 78.00
    },
    NewVehicleSale: {
      enabled: true,
      price: 0.00
    },
    UsedVehicleSale: {
      enabled: true,
      price: 0.00
    },
    Lead: {
      enabled: true,
      price: 39.00
    },
    EReputation: {
      enabled: true,
      price: 20.00
    },
    Analytics: {
      enabled: true,
      price: 0.00
    },
    Coaching: {
      enabled: true,
      price: 0.00
    },
    Connect: {
      enabled: true,
      price: 0.00
    },
    users: {
      included: 2,
      price: 3.00
    },
    contacts: {
      bundle: false,
      every: 100,
      included: 0,
      price: 0.20
    },
    CrossLeads: {
      enabled: true,
      price: 69,
      included: 2,
      unitPrice : 19,
      restrictMobile: false,
      minutePrice: 0.15
    },
    Automation: {
      enabled: true,
      price: 99,
      included: 0,
      every: 0.2
    },
    priceValidated: true
  }, {
    name: 'Miroir',
    setup: {
      enabled: false,
      price: 0.00,
      monthOffset: 0,
      billDate: '',
      alreadyBilled: false
    },
    Maintenance: {
      enabled: true,
      price: 39.00
    },
    NewVehicleSale: {
      enabled: true,
      price: 0.00
    },
    UsedVehicleSale: {
      enabled: true,
      price: 0.00
    },
    Lead: {
      enabled: true,
      price: 0.00
    },
    Analytics: {
      enabled: true,
      price: 0.00
    },
    Coaching: {
      enabled: true,
      price: 0.00
    },
    Connect: {
      enabled: true,
      price: 0.00
    },
    users: {
      prorata: false,
      included: 3,
      price: 3
    },
    contacts: {
      bundle: false,
      every: 100,
      included: 0,
      price: 0.19
    },
    CrossLeads: {
      enabled: true,
      price: 0,
      included: 2,
      unitPrice : 0,
      restrictMobile: false,
      minutePrice: 0.15
    },
    Automation: {
      enabled: true,
      price: 0,
      included: 0,
      every: 0.2
    },
    mirror: true,
    priceValidated: true
  }
];
