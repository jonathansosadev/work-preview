const TestApp = require('../../../common/lib/test/test-app');
const testTools = require('../../../common/lib/test/testtools');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const campaignStatus = require('../../../common/models/data/type/campaign-status');
const timeHelper = require('../../../common/lib/util/time-helper');
const chai = require('chai').use(require('chai-as-promised')); // eslint-disable-line
// eslint-disable-next-line
const should = chai.should(); // enable .should for promise assertions
const expect = chai.expect;
const app = new TestApp();
const Data = app.server.models.Data;
const DataBuilder = require('../../../common/lib/test/test-instance-factory/data-builder');
const config = require('config');
const ContactStatus = require('../../../common/models/contact.status');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Test the model 'data'
 */
describe('Data model Campaign', () => {
  const nullCustomerContact = {
    value: null,
    original: null,
    isEmpty: true,
    isValidated: false,
  };
  const mobile0625 = {
    value: '0625000000',
    isSyntaxOK: true,
    isEmpty: false,
  };
  const droppedContact = (value) => {
    return {
      value,
      original: value,
      isSyntaxOK: true,
      isEmpty: false,
      isValidated: false,
      isDropped: true,
    };
  };
  const blablaMail = (value) => {
    return {
      value,
      isSyntaxOK: false,
      isEmpty: false,
      isValidated: false,
    };
  };
  const validatedContact = (value) => {
    return {
      value: value,
      original: value,
      isSyntaxOK: true,
      isEmpty: false,
      isValidated: true,
    };
  };
  const notValidatedContact = (value) => {
    return {
      value,
      original: value,
      isSyntaxOK: true,
      isEmpty: false,
      isValidated: false,
    };
  };
  const nicolasBalem = {
    frontDestUserName: 'BALEM Nicolas',
    frontDeskGarageId: '13',
    frontDeskCustomerId: '27918',
    providedAt: '2017-10-30T23:00:00.000Z',
    categories: null,
    isQuote: false,
  };
  const alanJoncourt = {
    frontDeskUserName: 'JONCOUR ALAN',
    providedAt: '2017-10-30T23:00:00.000Z',
    categories: null,
    isQuote: false,
  };

  beforeEach(async function () {
    await app.waitAppBoot();
    await app.reset();
  });

  // to catch the rejection we need to return the should.be` => as many test as 'shoulds'
  // https://github.com/domenic/chai-as-promised/issues/173
  it('generate data EmailStatus Empty', async () => {
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .createAndGenerateStatus('email');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.emailStatus).equal('Empty');

    const email = { isEmpty: true };
    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .createAndGenerateStatus('email');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.emailStatus).equal('Empty');
  });
  it('generate data EmailStatus Wrong', async () => {
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(blablaMail('blabla@gs.com'))
      .createAndGenerateStatus('email');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.emailStatus).equal('Wrong');

    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(droppedContact('blabla@gs.com'))
      .createAndGenerateStatus('email');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.emailStatus).equal('Dropped');
  });
  it('generate data EmailStatus Valid', async () => {
    const email = notValidatedContact('blabla@gs.com');
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .campaignStatus(campaignStatus.RUNNING)
      .hasBeenContacted(false, true)
      .createAndGenerateStatus('email', false, 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.emailStatus).equal('Valid');
    expect(data.campaign.contactStatus.status).equal('Received');

    email.isDropped = false;
    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .createAndGenerateStatus('email');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.emailStatus).equal('Valid');
  });
  it('generate data EmailStatus UNSUBSCRIBED', async () => {
    const email = notValidatedContact('blabla@gs.com');
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .previouslyUnsubscribed('email')
      .createAndGenerateStatus('email');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.emailStatus).equal('Unsubscribed');

    email.isUnsubscribed = true;
    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .previouslyUnsubscribed('email')
      .createAndGenerateStatus('email');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.emailStatus).equal('Unsubscribed');

    delete email.isUnsubscribed;
    const data3 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .previouslyComplained('email')
      .createAndGenerateStatus('email');
    expect(data3.campaign.contactStatus).to.not.be.undefined;
    expect(data3.campaign.contactStatus.emailStatus).equal('Unsubscribed');

    email.isComplained = true;
    const data4 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .previouslyComplained('email')
      .createAndGenerateStatus('email');
    expect(data4.campaign.contactStatus).to.not.be.undefined;
    expect(data4.campaign.contactStatus.emailStatus).equal('Unsubscribed');
  });
  it('generate data EmailStatus RECENTLY_CONTACTED', async () => {
    const email = notValidatedContact('blabla@gs.com');
    email.isComplained = false;

    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .email(email)
      .previouslyContacted('email')
      .previouslyComplained(false)
      .createAndGenerateStatus('email');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.emailStatus).equal('RecentlyContacted');
  });
  it('generate data PhoneStatus Empty', async () => {
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .createAndGenerateStatus(null, 'phone');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');

    const phone = { isEmpty: true };
    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .phone(phone)
      .createAndGenerateStatus(null, 'phone');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.phoneStatus).equal('Empty');
  });
  it('generate data PhoneStatus Wrong', async () => {
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(blablaMail('blabla@gs.com'))
      .createAndGenerateStatus(null, 'phone');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Wrong');

    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(droppedContact('blabla@gs.com'))
      .createAndGenerateStatus(null, 'phone');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.phoneStatus).equal('Wrong');
  });
  it('generate data PhoneStatus Valid', async () => {
    mobilePhone = notValidatedContact('blabla@gs.com');
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobilePhone)
      .campaignStatus(campaignStatus.RUNNING)
      .hasBeenContacted(false, 'phone')
      .createAndGenerateStatus(null, 'phone', 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Valid');
    expect(data.campaign.contactStatus.status).equal('Received');

    mobilePhone.isDropped = false;
    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobilePhone)
      .createAndGenerateStatus(null, 'phone');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.phoneStatus).equal('Valid');
  });
  it('generate data PhoneStatus UNSUBSCRIBED', async () => {
    const mobilePhone = notValidatedContact('blabla@gs.com');
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobilePhone)
      .previouslyUnsubscribed(false, 'phone')
      .createAndGenerateStatus(null, 'phone');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Unsubscribed');

    mobilePhone.isUnsubscribed = true;
    const data2 = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobilePhone)
      .previouslyUnsubscribed(false, 'phone')
      .createAndGenerateStatus(null, 'phone');
    expect(data2.campaign.contactStatus).to.not.be.undefined;
    expect(data2.campaign.contactStatus.phoneStatus).equal('Unsubscribed');
  });
  it('generate data PhoneStatus RECENTLY_CONTACTED', async () => {
    const mobilePhone = notValidatedContact('blabla@gs.com');
    mobilePhone.isComplained = false;
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobilePhone)
      .campaignStatus(campaignStatus.RUNNING)
      .previouslyContacted(undefined, 'phone')
      .previouslyComplained(undefined, 'phone')
      .createAndGenerateStatus(null, 'phone');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('RecentlyContacted');
  });
  it('generate data Status for new Campaign (not yet run) must be scheduled', async () => {
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobile0625)
      .campaignStatus(campaignStatus.NEW)
      .fillContactStatuses(false)
      .createAndGenerateStatus(null, 'phone', 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.status).equal('Scheduled');
  });
  it('generate data Status for scheduled Campaign (not yet run) must be scheduled', async () => {
    const data = await new DataBuilder(app)
      .garage('12345678')
      .type('toto')
      .source('toto', {})
      .mobilePhone(mobile0625)
      .campaignStatus(campaignStatus.RUNNING)
      .fillContactStatuses(false)
      .firstContactDay(24 * 3)
      .createAndGenerateStatus(null, 'phone', 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.status).equal('Scheduled');
  });
  it('generate contact status for previouslyDropped email and empty phone => status = Blocked', async () => {
    const data = await new DataBuilder(app)
      .garage('56fc47f75e42f41a00200f04')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(nicolasBalem)
      .email(notValidatedContact('infoduport@duport.fr'))
      .mobilePhone(nullCustomerContact)
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .fillContactStatuses(false)
      .previouslyDropped('email', false)
      .createAndGenerateStatus('email', 'phone', 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');
    expect(data.campaign.contactStatus.emailStatus).equal('Dropped');
    expect(data.campaign.contactStatus.status).equal('Blocked');
  });
  it('generate contact status for syntax not Ok email and empty phone => status = Impossible', async () => {
    const data = await new DataBuilder(app)
      .garage('56fc47f75e42f41a00200f04')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(nicolasBalem)
      .email(blablaMail('blablabla'))
      .mobilePhone(nullCustomerContact)
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .fillContactStatuses(false)
      .createAndGenerateStatus('email', 'phone', 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');
    expect(data.campaign.contactStatus.emailStatus).equal('Wrong');
    expect(data.campaign.contactStatus.status).equal('Impossible');
  });
  it('generate contact status for syntax not Ok email and empty phone => status = Impossible', async () => {
    const data = await new DataBuilder(app)
      .garage('56fc47f75e42f41a00200f04')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(nicolasBalem)
      .email(nullCustomerContact)
      .mobilePhone(nullCustomerContact)
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .fillContactStatuses(false)
      .createAndGenerateStatus('email', 'phone', 'campaignContact');
    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');
    expect(data.campaign.contactStatus.emailStatus).equal('Empty');
    expect(data.campaign.contactStatus.status).equal('Impossible');
  });
  it('generate contact status for isDropped email and empty phone => status = Blocked', async () => {
    const data = await new DataBuilder(app)
      .garage('570ec7213bbdaa1a004edcc0')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(alanJoncourt)
      .email(droppedContact('taharount.h.m@hotmail.fr'))
      .mobilePhone(nullCustomerContact)

      .campaignId('59f978a3442e5a03006a6521')
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .campaignImportedAt('2017-11-01T07:32:51.984Z')
      .fillContactStatuses(false)
      .hasBeenContacted('email', false)

      .firstContactedAt('2017-11-01T07:32:51.984Z')
      .lastCampaignContact('E-mail Contact #1', '2017-11-01T10:37:54.716Z')
      .firstContactDay(0, 1, new Date('2017-11-01T07:32:51.984Z'))
      .nextCampaignContact('SMS Contact #1', 1, null, new Date('2017-11-01T07:32:51.984Z'))
      .fillContactScenario()
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');
    expect(data.campaign.contactStatus.emailStatus).equal('Dropped');
    expect(data.campaign.contactStatus.status).equal('Blocked');
  });
  it('generate contact status for empty email and previouslyContacted phone => status = Blocked', async () => {
    const service = {
      frontDeskUserName: 'Laurent Capdenat',
      frontDeskCustomerId: '10751568',
      providedAt: '2017-11-09T23:00:00.000Z',
      categories: null,
      isQuote: false,
    };
    const email = {
      ...nullCustomerContact,
      ...{ isEmpty: false, isValidated: false },
    };

    const data = await new DataBuilder(app)
      .garage('58872b0eec23f91a00fcbd67')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(service)
      .email(email)
      .mobilePhone(notValidatedContact('+33 6 03 16 07 43'))
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .previouslyContacted(false, 'phone')
      .phoneBlocked()
      .previouslyDropped(false, false)
      .previouslyUnsubscribed(false, false)
      .previouslyComplained(false)
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('RecentlyContacted');
    expect(data.campaign.contactStatus.emailStatus).equal('Empty');
    expect(data.campaign.contactStatus.status).equal('Blocked');
  });
  it('generate contact status for previouslyContacted email and empty phone => status = Blocked', async () => {
    const service = {
      frontDeskUserName: 'Teddy ENFERT',
      frontDeskGarageId: '70',
      frontDeskCustomerId: '992300',
      providedAt: '2017-10-30T23:00:00.000Z',
      categories: null,
      isQuote: false,
    };
    const data = await new DataBuilder(app)
      .garage('5665922cd6c403604b655e45')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(service)
      .email(notValidatedContact('srichard@amplitude-auto.com'))
      .mobilePhone(nullCustomerContact)
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .previouslyContacted(false, 'phone')
      .phoneEmpty()
      .emailBlocked()
      .hasBeenContacted(false, false)
      .previouslyDropped(false, false)
      .previouslyUnsubscribed(false, false)
      .previouslyComplained(false)
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');
    expect(data.campaign.contactStatus.emailStatus).equal('RecentlyContacted');
    expect(data.campaign.contactStatus.status).equal('Blocked');
  });
  it('generate contact status for valid email and empty phone => status = Received', async () => {
    const service = {
      frontDeskUserName: 'Bruno Guyen',
      frontDeskCustomerId: '30336922',
      providedAt: '2017-12-09T23:00:00.000Z',
      categories: ['Maintenance5'],
      isQuote: false,
    };
    const data = await new DataBuilder(app)
      .garage('58872c0eec23f91a00fcbd73')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(service)
      .email(validatedContact('m.morkos@gge.fr'))
      .mobilePhone(nullCustomerContact)
      .validateCustomer()

      .campaignStatus(campaignStatus.RUNNING)
      .fillContactStatuses(false)
      .emailReceived()
      .phoneEmpty()

      .firstContactedAt('2017-10-17T09:14:19.142Z')
      .firstContactDay(0, 1, new Date('2017-10-17T09:14:19.142Z'))
      .lastCampaignContact('Thank You E-mail', new Date('2017-10-21T21:49:50.867Z'))
      .nextCampaignContact(null, null, 24, new Date('2017-10-17T09:14:19.142Z'))
      .fillContactScenario()
      .lead({ type: 'NotInterested', knownVehicle: false, isConverted: false, reportedAt: '2018-01-16T21:58:48.588Z' })
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Empty');
    expect(data.campaign.contactStatus.emailStatus).equal('Valid');
    expect(data.campaign.contactStatus.status).equal('Received');
  });
  it('generate contact status for isDropped email and valid phone and send ByPhone=> status = Received', async () => {
    const service = {
      frontDeskUserName: 'HENRARD Christophe',
      frontDeskGarageId: '8',
      providedAt: '2017-10-19T22:00:00.000Z',
      categories: null,
      isQuote: false,
    };
    const data = await new DataBuilder(app)
      .garage('59ccb48c8470f71200809b97')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(service)
      .email(droppedContact('saadnamohamed@dartybox.com'))
      .mobilePhone(notValidatedContact('+33 6 89 31 65 09'))

      .campaignId('59eaf9c24da05c0300909de2')
      .campaignStatus(campaignStatus.RUNNING)
      .campaignImportedAt('2017-10-21T07:39:46.866Z')
      .fillContactStatuses()
      .emailWrong()
      .phoneReceived()

      .firstContactedAt('2017-10-21T07:39:46.866Z')
      .firstContactDay(0, 1, new Date('2017-10-21T07:39:46.866Z'))
      .lastCampaignContact('E-mail Contact #3', new Date('2017-10-26T09:32:12.628Z'))
      .fillContactScenario()
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Valid');
    expect(data.campaign.contactStatus.emailStatus).equal('Dropped');
    expect(data.campaign.contactStatus.status).equal('Received');
  });
  it('generate contact status for isDropped email and valid phone but not yet send by phone => status = Scheduled', async () => {
    const data = await new DataBuilder(app)
      .garage('570ec7213bbdaa1a004edcc0')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(alanJoncourt)
      .email(droppedContact('taharount.h.m@hotmail.fr'))
      .mobilePhone(notValidatedContact('+33 6 03 16 07 43'))

      .campaignId('59f978a3442e5a03006a6521')
      .campaignStatus(campaignStatus.RUNNING)
      .campaignImportedAt('2017-11-01T07:32:51.984Z')
      .fillContactStatuses(false)
      .hasBeenContacted('email', false)

      .firstContactedAt('2017-11-01T07:32:51.984Z')
      .firstContactDay(0, 1, new Date('2017-11-01T07:32:51.984Z'))
      .lastCampaignContact('E-mail Contact #1', new Date('2017-11-01T10:37:54.716Z'))
      .nextCampaignContact('SMS Contact #1', 1)
      .fillContactScenario()
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Valid');
    expect(data.campaign.contactStatus.emailStatus).equal('Dropped');
    expect(data.campaign.contactStatus.status).equal('Scheduled');
  });
  it('generate contact status for valid email and valid phone but campaignStatus = withoutCampaign => status = Blocked', async () => {
    const service = {
      frontDeskUserName: '27',
      providedAt: '2017-11-02T00:00:00.000Z',
      categories: null,
      isQuote: false,
    };
    const data = await new DataBuilder(app)
      .garage('58ad7452e1b38d1a0073cecf')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(service)
      .email(notValidatedContact('mj.eygonnet@free.fr'))
      .mobilePhone(notValidatedContact('+33 6 03 16 07 43'))
      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .campaignImportedAt('2017-11-01T07:32:51.984Z')
      .fillContactStatuses(false)
      .fillContactScenario()
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Valid');
    expect(data.campaign.contactStatus.emailStatus).equal('Valid');
    expect(data.campaign.contactStatus.status).equal('Blocked');
  });
  it('generate contact status for recently contacted email and valid phone but withoutCampaign => status = Blocked', async () => {
    const service = {
      frontDeskUserName: 'François Huyghe',
      frontDeskGarageId: '27',
      providedAt: '2017-10-30T23:00:00.000Z',
      categories: null,
      isQuote: false,
    };
    const data = await new DataBuilder(app)
      .garage('57f3b8f04566381900623c9c')
      .type('Maintenance')
      .shouldSurfaceInStatistics()
      .service(service)
      .email(notValidatedContact('serdar59200@hotmail.fr'))
      .mobilePhone(notValidatedContact('+33 6 83 23 38 15'))

      .campaignStatus(campaignStatus.WITHOUTCAMPAIGN)
      .campaignImportedAt('2017-11-01T07:32:51.984Z')
      .fillContactStatuses(false)
      .previouslyContacted('email', false)
      .fillContactScenario()
      .createAndGenerateStatus('email', 'phone', 'campaignContact');

    expect(data.campaign.contactStatus).to.not.be.undefined;
    expect(data.campaign.contactStatus.phoneStatus).equal('Valid');
    expect(data.campaign.contactStatus.emailStatus).equal('RecentlyContacted');
    expect(data.campaign.contactStatus.status).equal('Blocked');
  });
  it('#1844 Campaign received when email is revised and revised email dropped', async function test() {
    const garage = await app.addGarage();
    const person = testTools.random.person();
    person.mobilePhone = ' '; // So we're sure it doesn't send SMSs
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    let datas = await app.datas();
    datas[0].customer_revise('contact.email', 'revised@email.gs');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();
    await app.dropMailgunContact({ email: 'revised@email.gs' });
    await app.simulateMailgunResponse();

    datas = await app.datas();
    expect(datas[0].campaign.contactStatus.emailStatus).equal('Dropped');
    expect(datas[0].campaign.contactStatus.status).equal('Received');
  });
  it('#1844 Campaign received when email is revised and original email dropped', async function test() {
    const garage = await app.addGarage();
    const person = testTools.random.person();
    person.mobilePhone = ' '; // So we're sure it doesn't send SMSs
    if (config.has('contact.override.to.emailAddress')) {
      person.email = config.get('contact.override.to.emailAddress');
    }
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    let datas = await app.datas();
    datas[0].customer_revise('contact.email', 'revised@email.gs');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();
    await app.dropMailgunContact({ email: person.email });
    await app.simulateMailgunResponse();

    await new Promise((res) => setTimeout(() => res(), 5000));
    datas = await app.datas();
    expect(datas[0].campaign.contactStatus.emailStatus).equal('Valid');
    expect(datas[0].campaign.contactStatus.status).equal('Received');
  });
  it('#1844 Campaign received when phone is revised. Revised phone dropped', async function test() {
    const garage = await app.addGarage({ specialTestScenario: true });
    const person = testTools.random.person();
    person.email = 'nc@nc.com'; // So we're sure it doesn't send Emails
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    let datas = await app.datas();
    datas[0].customer_revise('contact.mobilePhone', '+33600000000'); // Phone number to be dropped
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();

    datas = await app.datas();
    expect(datas[0].campaign.contactStatus.phoneStatus).equal('Wrong');
    expect(datas[0].campaign.contactStatus.status).equal('Received');
  });
  it('#1844 Campaign received when phone is revised. Original phone dropped', async function test() {
    const garage = await app.addGarage({ specialTestScenario: true });
    const person = testTools.random.person();
    person.email = 'nc@nc.com'; // So we're sure it doesn't send Emails
    person.mobilePhone = '+33600000000'; // Phone number to be dropped
    const campaign = await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    await app.sendWaitingContacts();
    let datas = await app.datas();
    datas[0].customer_revise('contact.mobilePhone', '0601020304');
    await datas[0].save();
    await campaign.sendNextContacts();
    await app.sendWaitingContacts();

    datas = await app.datas();
    expect(datas[0].campaign.contactStatus.phoneStatus).equal('Valid');
    expect(datas[0].campaign.contactStatus.status).equal('Received');
  });
  it('falls back to sending SMS when emails are bounced', async function test() {
    const garage = await app.addGarage();
    const person = testTools.random.person();
    await garage.runNewCampaign(dataFileTypes.MAINTENANCES, person);
    let contacts = await app.models.Contact.find({});
    // let datas = await app.datas({ garageId: garage.garageId });
    // Check that email is indeed waiting
    expect(contacts[0].status).equal(ContactStatus.WAITING);

    await app.sendWaitingContacts();
    contacts = await app.models.Contact.find({});
    let datas = await app.datas({ garageId: garage.garageId });
    expect(contacts[0].status).equal(ContactStatus.SEND);
    expect(datas[0].campaign.contactStatus.emailStatus).equal('Valid');
    expect(datas[0].campaign.contactScenario.nextCampaignContact).to.match(/email/i);
    // await sleep(1000);

    await app.dropMailgunContact(person);
    await app.simulateMailgunResponse();
    // await sleep(1000);
    // await app.dropMailgunContact(person);
    // await app.simulateMailgunResponse();
    // The above function call (simulateMailgunResponse) triggers an event in models/Contact, EMAIL_DROP in this case
    // As it is an event that's triggered, the await may (and it does here) return before the event handler has finished its execution
    // So we're forced to wait for a short amount of time because we will be checking the effects of the fired event below
    contacts = await app.models.Contact.find({});
    datas = await app.datas({ garageId: garage.garageId });
    // Check that the email is marked as dropped and that the next thing to send is an SMS
    // console.log(JSON.stringify(datas[0], null, 2));
    expect(contacts[0].status).equal(ContactStatus.DROPPED);
    expect(datas[0].campaign.contactStatus.emailStatus).equal('Dropped');
    expect(datas[0].campaign.contactScenario.nextCampaignContact).to.match(/sms/i);
  });
});
