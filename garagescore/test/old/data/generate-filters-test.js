const { ObjectId } = require('mongodb');
const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const DataFilters = require('../../../server/webservers-standalones/api/_common/data-generate-filters');
const GarageType = require('../../../common/models/garage.type');
const ContactTicketStatus = require('../../../common/models/data/type/contact-ticket-status');
const GarageHistory = require('../../../common/models/garage-history.period');
const EmailStatus = require('../../../common/models/data/type/email-status');
const PhoneStatus = require('../../../common/models/data/type/phone-status');

const { expect } = chai;
const app = new TestApp();

describe('DataFilters class (used in Apollo queries on Data)', () => {
  beforeEach(async () => {
    await app.reset();
  });

  it('it should return basic filter for contact list', (done) => {
    const filters = new DataFilters().setBasicFilterForContactList().generateMatch();

    expect(filters['source.type']).equal('DataFile');
    expect(filters.shouldSurfaceInStatistics).equal(true);
    expect(filters['campaign.status'].$ne).equal('Cancelled');
    expect(filters.type.$ne).equal('Unknown');
    done();
  });

  it('sets garageId filter', () => {
    // const garageNotInScope = 'garage_outta_compton';
    const garageInScope = new ObjectId().toString();
    const userGarages = Array.from(Array(10)).map((e, i) => new ObjectId().toString());

    // Only putting user garages
    let filters = new DataFilters().setGarageId(userGarages).generateMatch();
    expect(filters.garageId.$in).to.be.an('Array').and.to.have.lengthOf(10);
    expect(filters.garageId.$in).to.include.members(userGarages);

    // Specifying a single garageId
    filters = new DataFilters().setGarageId(userGarages, garageInScope).generateMatch();
    expect(filters.garageId).to.be.a('string').and.to.equal(garageInScope);

    // Option followed (for leads)
    filters = new DataFilters().setGarageId(userGarages, null, { followed: true }).generateMatch();
    expect(filters['source.garageId'].$in).to.be.an('Array').and.to.have.lengthOf(10);
    expect(filters['source.garageId'].$in.map((g) => g.toString())).to.include.members(userGarages);
    filters = new DataFilters().setGarageId(userGarages, garageInScope, { followed: true }).generateMatch();
    expect(filters['source.garageId'].toString()).to.be.a('string').and.to.equal(garageInScope);
  });

  it('it should set cockpitType on filter', (done) => {
    const args = {
      cockpitType: GarageType.DEALERSHIP,
    };
    const filters = new DataFilters().setCockpitType(args.cockpitType).generateMatch();

    expect(filters.garageType.$in).to.be.an('Array');
    expect(filters.garageType.$in).to.have.length(7);
    expect(filters.garageType.$in).to.include(GarageType.DEALERSHIP);
    expect(filters.garageType.$in).to.include(GarageType.CARAVANNING);
    expect(filters.garageType.$in).to.include(GarageType.AGENT);
    expect(filters.garageType.$in).to.include(GarageType.CAR_REPAIRER);
    expect(filters.garageType.$in).to.include(GarageType.CAR_RENTAL);
    expect(filters.garageType.$in).to.include(GarageType.UTILITY_CAR_DEALERSHIP);
    expect(filters.garageType.$in).to.include(GarageType.OTHER);
    done();
  });

  it('it should set perdiodId on filter', (done) => {
    const args = {
      periodId: 'CURRENT_YEAR',
    };
    const filters = new DataFilters().setPeriodId(args.periodId).generateMatch();

    expect(filters.$and[0]['service.providedAt'].$gt.getMonth()).equal(0);
    expect(filters.$and[0]['service.providedAt'].$gt.getDate()).equal(1); // 1 january
    expect(filters.$and[1]['service.providedAt'].$lt.getMonth()).equal(11);
    expect(filters.$and[1]['service.providedAt'].$lt.getDate()).equal(31); // 31 december
    done();
  });

  it('sets perdiodId filter advanced use', () => {
    const dateField = 'leadTicket.createdAt';
    const after = new Date(new Date().getFullYear(), 2, 6); // Don't ask me why this date
    const before = new Date(new Date().getFullYear(), 4, 21); // Don't ask me either
    const ALL_HISTORY = 'ALL_HISTORY';
    const CURRENT_YEAR = 'CURRENT_YEAR';

    // Only using a date field
    let filters = new DataFilters().setPeriodId(CURRENT_YEAR, { dateField }).generateMatch();
    expect(filters.$and[0][dateField].$gt.getMonth()).equal(0);
    expect(filters.$and[0][dateField].$gt.getDate()).equal(1); // 1 january
    expect(filters.$and[1][dateField].$lt.getMonth()).equal(11);
    expect(filters.$and[1][dateField].$lt.getDate()).equal(31); // 31 december

    // Only using filterDefaultDate (has an effect on ALL_HISTORY)
    filters = new DataFilters().setPeriodId(ALL_HISTORY, { filterDefaultDate: true }).generateMatch();
    expect(filters['service.providedAt'].$gt.getTime()).equal(0);
    expect(filters['service.providedAt'].$lt).to.be.undefined;

    // Only using after
    filters = new DataFilters().setPeriodId(CURRENT_YEAR, { after }).generateMatch();
    expect(filters.$and[0]['service.providedAt'].$gt).deep.equal(after);
    expect(filters.$and[1]['service.providedAt'].$lt.getMonth()).equal(11);
    expect(filters.$and[1]['service.providedAt'].$lt.getDate()).equal(31); // 31 december
    filters = new DataFilters().setPeriodId(ALL_HISTORY, { after }).generateMatch();
    expect(filters['service.providedAt'].$gt).deep.equal(after);

    // Only using before
    filters = new DataFilters().setPeriodId(CURRENT_YEAR, { before }).generateMatch();
    expect(filters.$and[0]['service.providedAt'].$gt.getDate()).equal(1); // 1 january
    expect(filters.$and[0]['service.providedAt'].$gt.getMonth()).equal(0);
    expect(filters.$and[1]['service.providedAt'].$lt).deep.equal(before);
    filters = new DataFilters().setPeriodId(ALL_HISTORY, { before }).generateMatch();
    expect(filters['service.providedAt'].$lt).deep.equal(before);

    // Using both before and after
    filters = new DataFilters().setPeriodId(CURRENT_YEAR, { after, before }).generateMatch();
    expect(filters.$and[0]['service.providedAt'].$gt).deep.equal(after);
    expect(filters.$and[1]['service.providedAt'].$lt).deep.equal(before);
    filters = new DataFilters().setPeriodId(ALL_HISTORY, { after, before }).generateMatch();
    expect(filters.$and[0]['service.providedAt'].$gt).deep.equal(after);
    expect(filters.$and[1]['service.providedAt'].$lt).deep.equal(before);
  });

  it('it should set type on filter', (done) => {
    const args = {
      type: 'type_r',
    };
    const filters = new DataFilters().setType(args.type).generateMatch();

    expect(filters.type).equal('type_r');
    done();
  });

  it('it should set frontDeskUserName on filter', (done) => {
    const args = {
      frontDeskUserName: 'Franck%20BELARD',
    };
    const filters = new DataFilters().setFrontDeskUserName(args.frontDeskUserName).generateMatch();

    expect(filters['service.frontDeskUserName']).equal('Franck BELARD');
    done();
  });

  it('it should set email status on filter', (done) => {
    const args = {
      emailStatus: EmailStatus.VALID,
    };
    const filters = new DataFilters().setEmailStatus(args.emailStatus).generateMatch();

    expect(filters['campaign.contactStatus.emailStatus']).equal(EmailStatus.VALID);
    done();
  });

  it('it should set phone status on filter', (done) => {
    const args = {
      phoneStatus: PhoneStatus.EMPTY,
    };
    const filters = new DataFilters().setPhoneStatus(args.phoneStatus).generateMatch();

    expect(filters['campaign.contactStatus.phoneStatus']).equal(PhoneStatus.EMPTY);
    done();
  });

  it('it should set campaign status on filter', (done) => {
    const args = {
      periodId: 'CURRENT_YEAR',
      campaignStatus: 'ReceivedNotResponded',
    };
    const filters = new DataFilters().setCampaignStatus(args.campaignStatus, args.periodId).generateMatch();

    expect(filters['campaign.contactStatus.status']).equal('Received');
    expect(filters.review.$exists).equal(false);
    done();
  });

  it('it should set revision status on filter', (done) => {
    const args = {
      revisionStatus: 'Revised',
    };
    const filters = new DataFilters().setRevisionStatus(args.revisionStatus).generateMatch();

    expect(filters['customer.isRevised']).equal(true);
    done();
  });

  it('it should set ticket status on filter', (done) => {
    const args = {
      periodId: GarageHistory.CURRENT_YEAR,
      ticketStatus: ContactTicketStatus.TO_RECONTACT,
    };
    const filters = new DataFilters().setTicketStatus(args.ticketStatus, args.periodId).generateMatch();

    expect(filters.contactTicket.$exists).equal(false);
    expect(filters.review.$exists).equal(false);
    expect(filters['campaign.contactStatus.status']).equal('Received');
    expect(filters['campaign.contactStatus.phoneStatus']).equal(PhoneStatus.VALID);
    done();
  });

  it('it should set search on filter', (done) => {
    const args = {
      search: 'bob',
    };
    const filters = new DataFilters().setSearch(args.search).generateMatch();

    expect(filters['customer.fullName.value'].toString()).equal('/bob/i');
    done();
  });

  it('it should set dataId on filter', (done) => {
    const args = {
      dataId: '591960068725ce1a003e8a92',
    };
    const filters = new DataFilters().setDataId(args.dataId).generateMatch();

    expect(ObjectId.isValid(filters._id)).equal(true);
    expect(filters._id).to.be.instanceOf(ObjectId);
    done();
  });

  it('it should generate filters', (done) => {
    const args = {
      periodId: 'CURRENT_YEAR',
      frontDeskUserName: 'Franck%20BELARD',
      search: '95540',
      limit: 10,
      skip: 0,
      contactsOrder: 'DESC',
      cockpitType: 'Dealership',
    };
    const filters = new DataFilters()
      .setBasicFilterForContactList()
      .setCockpitType(args.cockpitType)
      .setPeriodId(args.periodId)
      .setType(args.type)
      .setFrontDeskUserName(args.frontDeskUserName)
      .setEmailStatus(args.emailStatus)
      .setPhoneStatus(args.phoneStatus)
      .setCampaignStatus(args.campaignStatus, args.periodId)
      .setRevisionStatus(args.revisionStatus)
      .setTicketStatus(args.ticketStatus, args.periodId)
      .setSearch(args.search)
      .setDataId(args.dataId)
      .generateMatch();

    expect(filters.garageType.$in).to.be.an('Array');
    expect(filters.garageType.$in).to.have.length(7);
    expect(filters.garageType.$in).to.include(GarageType.DEALERSHIP);
    expect(filters.garageType.$in).to.include(GarageType.AGENT);
    expect(filters.garageType.$in).to.include(GarageType.CAR_REPAIRER);
    expect(filters.garageType.$in).to.include(GarageType.CAR_RENTAL);
    expect(filters.garageType.$in).to.include(GarageType.UTILITY_CAR_DEALERSHIP);
    expect(filters.garageType.$in).to.include(GarageType.OTHER);
    expect(filters.garageType.$in).to.include(GarageType.CARAVANNING);
    expect(filters['source.type']).equal('DataFile');
    expect(filters.shouldSurfaceInStatistics).equal(true);
    expect(filters['campaign.status'].$ne).equal('Cancelled');
    expect(filters.type.$ne).equal('Unknown');
    expect(filters.$and[0]['service.providedAt'].$gt.getMonth()).equal(0);
    expect(filters.$and[0]['service.providedAt'].$gt.getDate()).equal(1); // 1 january
    expect(filters.$and[1]['service.providedAt'].$lt.getMonth()).equal(11);
    expect(filters.$and[1]['service.providedAt'].$lt.getDate()).equal(31); // 31 december
    expect(filters['service.frontDeskUserName']).equal('Franck BELARD');
    expect(filters['customer.postalCode.value']).equal('95540');
    done();
  });
  it('it should be detect search by phone number', (done) => {
    const phoneNumbersToTest = [
      '0630285874',
      '+33 6 30285874',
      '+33630285874',
      '+330630285874',
      '+377630285874',
      '+377 6 30285874',
      '+33 6 30 28 58 74',
      '06 30 28 58 74'
    ]
    for (const phoneNumber of phoneNumbersToTest) {
      const detectedPhone = DataFilters.searchCustomer(phoneNumber)
      expect(detectedPhone).to.have.property('key').equal('customer.contact.mobilePhone.value')
      expect(detectedPhone.value.source).equal('285874')
    }
    done();
  })
});
