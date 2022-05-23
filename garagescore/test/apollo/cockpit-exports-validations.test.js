const chai = require('chai');
const testTools = require('../../common/lib/test/testtools');
const {
  ExportTypes,
  ExportCategories,
  UserRoles,
  ExportPeriods,
  ExportFrequencies,
} = require('../../frontend/utils/enumV2');
const FieldsHandler = require('../../common/lib/garagescore/cockpit-exports/fields/fields-handler');
const sendQuery = require('./_send-query-as');
const TestApp = require('../../common/lib/test/test-app');

const expect = chai.expect;
const testApp = new TestApp();

const queryName = 'CockpitExport';
const query = `query ${queryName}($exportName: String, $exportType: String!, $periodId: String, $startPeriodId: String, $endPeriodId: String, $dataTypes: [String], $garageIds: [String!], $fields: [String!]!, $recipients: [String!]!, $frontDeskUsers : [FrontDeskUser!], $cockpitType : String, $adminFilterRole: String, $adminFilterJob: String, $adminFilterLastCockpitOpenAt: String, $adminSearch: String, $frequency: String!) {
  ${queryName}(exportName: $exportName, exportType: $exportType, periodId: $periodId, startPeriodId: $startPeriodId, endPeriodId: $endPeriodId, dataTypes: $dataTypes, garageIds: $garageIds, fields: $fields, recipients: $recipients, frontDeskUsers : $frontDeskUsers, cockpitType: $cockpitType, adminFilterRole: $adminFilterRole, adminFilterJob:  $adminFilterJob, adminFilterLastCockpitOpenAt: $adminFilterLastCockpitOpenAt, adminSearch: $adminSearch, frequency: $frequency) {
    status
    message
    data {
      recipients
    }
  }
}`;

const generateUserWithGarageIds = async ({ role = UserRoles.ADMIN } = {}) => {
  // generate a random user
  const user = testTools.random.user();
  // generate and add to testApp a random garage
  const garage = await testApp.models.Garage.create(testTools.random.garage());
  // add garageIds to the random user
  user.garageIds = [garage.getId()];
  // add a role to the random user
  user.role = role;
  // add to testApp the random user
  return testApp.models.User.create(user);
};

let currentUser;

const sendQueryWithArgs = async (args) => {
  return sendQuery(testApp, query, args, currentUser.id);
};

//----------------------------------------------------
//----------------------COMMON------------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : Common', () => {
  const exportType = ExportTypes.GARAGES;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because the exportType arg is missing', async () => {
    const res = await sendQueryWithArgs({
      fields: [],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data).to.be.undefined;
    expect(res.errors[0].message).to.include('$exportType');
  });

  it('should throw because the fields arg is missing', async () => {
    const res = await sendQueryWithArgs({
      frequency: ExportFrequencies.NONE,
      exportType,
      recipients: ['yolo@gmail.com'],
    });
    expect(res.data).to.be.undefined;
    expect(res.errors[0].message).to.include('$fields');
  });

  it('should throw because the frequency arg is missing', async () => {
    const res = await sendQueryWithArgs({
      fields: [],
      exportType,
      recipients: ['yolo@gmail.com'],
    });
    expect(res.data).to.be.undefined;
    expect(res.errors[0].message).to.include('$frequency');
  });

  it('should throw because the recipients arg is missing', async () => {
    const res = await sendQueryWithArgs({ exportType, fields: [], frequency: ExportFrequencies.NONE });
    expect(res.data).to.be.undefined;
    expect(res.errors[0].message).to.include('$recipients');
  });

  it('should throw because exportType is missing or invalid', async () => {
    const res = await sendQueryWithArgs({
      exportType: '',
      fields: [],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });

    expect(res.errors).to.be.undefined;
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('ExportType');
  });

  it('should throw if a user has not access to the requested garageIds', async () => {
    const garageId = testTools.random.uniqid();
    const res = await sendQuery(
      testApp,
      query,
      {
        exportType,
        fields: ['BG_COM__GARAGE'],
        recipients: ['yolo@gmail.com'],
        frequency: ExportFrequencies.NONE,
        periodId: ExportPeriods.LAST_QUARTER,
        dataTypes: ['All'],
        garageIds: [garageId],
      },
      currentUser.id
    );

    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('access');
  });
});

//----------------------------------------------------
//----------------------GARAGES-----------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By garages', () => {
  const fields = FieldsHandler[ExportCategories.BY_GARAGES].COMMON;
  const exportType = ExportTypes.GARAGES;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because periodId is missing', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('periodId');
  });

  it('should throw invalid periodId related error', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: 'testPeriod',
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('periodId');
  });

  // it('should throw because dataTypes are missing', async () => {
  //   const res = await sendQueryWithArgs({
  //     exportType,
  //     fields,
  //     recipients: ['yolo@gmail.com'],
  //     frequency: ExportFrequencies.NONE,
  //     periodId: ExportPeriods.LAST_QUARTER,
  //     garageIds: ['All'],
  //   });
  //   expect(res.data[queryName].status).to.equal('error');
  //   expect(res.data[queryName].message).to.include('dataTypes');
  // });

  // it('should throw because dataTypes are empty', async () => {
  //   const res = await sendQueryWithArgs({
  //     exportType,
  //     fields,
  //     recipients: ['yolo@gmail.com'],
  //     frequency: ExportFrequencies.NONE,
  //     periodId: ExportPeriods.LAST_QUARTER,
  //     dataTypes: [],
  //   });
  //   expect(res.data[queryName].status).to.equal('error');
  //   expect(res.data[queryName].message).to.include('UserInputError');
  // });

  it('should throw because dataTypes are not valid', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['testDataType'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by garages', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//------------------FRONTDESKUSERS-DMS----------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By frontdeskUsers DMS', () => {
  const fields = FieldsHandler[ExportCategories.BY_FRONT_DESK_USERS][ExportTypes.FRONT_DESK_USERS_DMS].COMMON;
  const exportType = ExportTypes.FRONT_DESK_USERS_DMS;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by frontdeskUsers DMS', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      frontDeskUsers: [{ id: 'All', frontDeskUserName: '' }],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//-----------------FRONTDESKUSERS-CUSTEED-------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By frontdeskUsers CUSTEED', () => {
  const fields = FieldsHandler[ExportCategories.BY_FRONT_DESK_USERS][ExportTypes.FRONT_DESK_USERS_CUSTEED].COMMON;
  const exportType = ExportTypes.FRONT_DESK_USERS_CUSTEED;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by frontdeskUsers CUSTEED', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['BF_COM__GARAGE'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      frontDeskUsers: [{ id: 'All', frontDeskUserName: '' }],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//-----------------------------------------------------
//---------------------SATISFACTION--------------------
//-----------------------------------------------------
describe('Apollo - CockpitExport : By data - Satisfaction', () => {
  const fields = FieldsHandler[ExportCategories.BY_DATA].SATISFACTION;
  const exportType = ExportTypes.SATISFACTION;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Satisfaction', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//-----------------------CONTACTS---------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By data - Contacts', () => {
  const fields = FieldsHandler[ExportCategories.BY_DATA].CONTACTS;
  const exportType = ExportTypes.CONTACTS;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Contacts', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//-------------------CONTACTS_MODIFIED----------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By data - Contacts Modified', () => {
  const fields = FieldsHandler[ExportCategories.BY_DATA].CONTACTS;
  const exportType = ExportTypes.CONTACTS_MODIFIED;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Contacts Modified', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//---------------------UNSATISFIED--------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By data - Unsatisfied', () => {
  const fields = FieldsHandler.getUnsatisfiedCriteriasFields(['All'], null);
  const exportType = ExportTypes.UNSATISFIED;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Unsatisfied', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//-----------------------LEADS------------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By data - Leads', () => {
  const fields = FieldsHandler[ExportCategories.BY_DATA].LEADS;
  const exportType = ExportTypes.LEADS;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Leads', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//------------------FORWARDED_LEADS-------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By data - Forwarded Lead', () => {
  const fields = FieldsHandler[ExportCategories.BY_DATA].LEADS;
  const exportType = ExportTypes.FORWARDED_LEADS;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Forwarded Leads', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//--------------------EREPUTATION---------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By data - Ereputation', () => {
  const fields = FieldsHandler[ExportCategories.BY_DATA].EREPUTATION;
  const exportType = ExportTypes.EREPUTATION;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: ['All'],
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by data - Ereputation', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      periodId: ExportPeriods.LAST_QUARTER,
      dataTypes: ['All'],
      garageIds: [],
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//--------------------ADMIN_USERS---------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By Admin Users', () => {
  const fields = FieldsHandler[ExportCategories.BY_ADMIN_USERS].COMMON;
  const exportType = ExportTypes.ADMIN_USERS;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because the role filter has an invalid value', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      adminFilterRole: 'testFilter',
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should throw because then lastCockpitOpenAt filter has an invalid value', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
      adminFilterLastCockpitOpenAt: 'testFilter',
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it("should throw because user role can't export admin", async () => {
    currentUser = await generateUserWithGarageIds({ role: UserRoles.USER });
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('ForbiddenError');
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it('should create the export by Admin users', async () => {
    const res = await sendQueryWithArgs({
      exportType,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});

//----------------------------------------------------
//-------------------ADMIN_GARAGES--------------------
//----------------------------------------------------
describe('Apollo - CockpitExport : By Admin Garages', () => {
  const fields = FieldsHandler[ExportCategories.BY_ADMIN_GARAGES].COMMON;
  beforeEach(async () => {
    await testApp.reset();
    currentUser = await generateUserWithGarageIds();
  });

  it('should throw because of wrong fields', async () => {
    const res = await sendQueryWithArgs({
      exportType: ExportTypes.ADMIN_GARAGES,
      fields: ['testField'],
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('UserInputError');
  });

  it("should throw because user role can't export admin", async () => {
    currentUser = await generateUserWithGarageIds({ role: UserRoles.USER });
    const res = await sendQueryWithArgs({
      exportType: ExportTypes.ADMIN_GARAGES,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('error');
    expect(res.data[queryName].message).to.include('ForbiddenError');
  });

  it('should create the export by Admin garages', async () => {
    const res = await sendQueryWithArgs({
      exportType: ExportTypes.ADMIN_GARAGES,
      fields,
      recipients: ['yolo@gmail.com'],
      frequency: ExportFrequencies.NONE,
    });
    expect(res.data[queryName].status).to.equal('success');
  });
});
