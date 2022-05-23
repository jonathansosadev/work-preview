const path = require('path');
const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');

const { expect } = chai;
const app = new TestApp();
const kpiPeriods = require('../../../common/lib/garagescore/kpi/KpiPeriods');
const { aggregateLeadsKpi, aggregateErepKpi } = require('../../../common/lib/garagescore/kpi/kpiAggregator');

describe('KPI aggregator', () => {
  beforeEach(async function () {
    await app.reset();
  });

  it('it should check datas restore from dump', async () => {
    await app.restore(path.resolve(`${__dirname}/dataWithLeadTicket.dump`));
    const datas = await app.models.Data.find();

    const checkLeadticketDatas = [
      { leadTicket: { vehicle: { plate: 'BV-449-CT' } } },
      { leadTicket: { vehicle: { plate: 'BM-268-PY' } } },
      { leadTicket: { vehicle: { plate: 'AB-226-MD' } } },
      { leadTicket: { vehicle: { plate: '886ACV77' } } },
      { leadTicket: { vehicle: { plate: 'CB-346-KK' } } },
      { leadTicket: { vehicle: { plate: 'BS-011-NQ' } } },
      { leadTicket: { vehicle: { plate: 'DK-428-ME' } } },
      { leadTicket: { vehicle: { plate: '4153XR56' } } },
      { leadTicket: { vehicle: { plate: 'BA-715-VS' } } },
      { leadTicket: { vehicle: { plate: 'AC-256-BA' } } },
      { leadTicket: { vehicle: { plate: 'AP-700-HG' } } },
      { leadTicket: { vehicle: { plate: 'CE-662-KL' } } },
      { leadTicket: { vehicle: { plate: 'DL-158-KX' } } },
      { leadTicket: { vehicle: { plate: 'BY-578-KE' } } },
      { leadTicket: { vehicle: { plate: 'EH-985-HS' } } },
      { leadTicket: { vehicle: { plate: 'ET-075-WY' } } },
      { leadTicket: { vehicle: { plate: 'EA-845-RY' } } },
      { leadTicket: { vehicle: { plate: '3671XN56' } } },
      { leadTicket: { vehicle: { plate: 'CQ-951-DN' } } },
      { leadTicket: { vehicle: { plate: 'DM-530-SG' } } },
      { leadTicket: { vehicle: { plate: 'BY-578-KE' } } },
      { leadTicket: { vehicle: { plate: 'BV-299-DY' } } },
      { leadTicket: { vehicle: { plate: 'CJ-641-CM' } } },
      { leadTicket: { vehicle: { plate: 'CR-370-XM' } } },
      { leadTicket: { vehicle: { plate: '9220YR56' } } },
      { leadTicket: { vehicle: { plate: 'FA-926-EJ' } } },
      { leadTicket: { vehicle: { plate: 'AC-256-BA' } } },
      { leadTicket: { vehicle: { plate: 'EJ-410-ZS' } } },
      { leadTicket: { vehicle: { plate: 'CW-096-XE' } } },
      { leadTicket: { vehicle: { plate: '1662YX56' } } },
      { leadTicket: { vehicle: { plate: 'CQ-299-DK' } } },
      { leadTicket: { vehicle: { plate: 'CH-962-CZ' } } },
      { leadTicket: { vehicle: { plate: 'EK-167-EJ' } } },
      { leadTicket: { vehicle: { plate: 'CF-354-TE' } } },
      { leadTicket: { vehicle: { plate: 'BR-022-MF' } } },
      { leadTicket: { vehicle: { plate: 'EP-619-XQ' } } },
    ];

    expect(datas.length).equal(36);

    for (let i = 0; i < checkLeadticketDatas.length; i++) {
      expect(datas[i].leadTicket.vehicle.plate).equal(checkLeadticketDatas[i].leadTicket.vehicle.plate);
    }
  });

  it('it should calculate leads KPI from dump datas', async () => {
    await app.restore(path.resolve(`${__dirname}/dataWithLeadTicket.dump`));
    const data = await app.models.Data.findOne({ garageId: '5a2821c9590aaa1300cd1a78' });

    const expectResult = {
      '2019-9': {
        _id: '5a2821c9590aaa1300cd1a78',
        followedGarageId: 0,
        countLeads: 2,
        countLeadsUnassigned: 0,
        countLeadsAssigned: 2,
        countLeadsUntouched: 2,
        countLeadsUntouchedOpen: 0,
        countLeadsUntouchedClosed: 2,
        countLeadsTouched: 0,
        countLeadsTouchedOpen: 0,
        countLeadsTouchedClosed: 0,
        countLeadsTouchedClosedForInactivity: 0,
        countLeadsReactive: 0,
        countLeadsWaitingForContact: 0,
        countLeadsContactPlanned: 0,
        countLeadsWaitingForMeeting: 0,
        countLeadsMeetingPlanned: 0,
        countLeadsWaitingForProposition: 0,
        countLeadsPropositionPlanned: 0,
        countLeadsWaitingForClosing: 0,
        countLeadsClosedWithoutSale: 2,
        countLeadsClosedWithSale: 0,
        countLeadsClosedWithSaleWasInterested: 0,
        countLeadsClosedWithSaleWasInContactWithVendor: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness: 0,
        countLeadsPotentialSales: 2,
        // Leads APV
        countLeadsApv: 0,
        countLeadsUnassignedApv: 0,
        countLeadsAssignedApv: 0,
        countLeadsUntouchedApv: 0,
        countLeadsUntouchedOpenApv: 0,
        countLeadsUntouchedClosedApv: 0,
        countLeadsTouchedApv: 0,
        countLeadsTouchedOpenApv: 0,
        countLeadsTouchedClosedApv: 0,
        countLeadsTouchedClosedForInactivityApv: 0,
        countLeadsReactiveApv: 0,
        countLeadsWaitingForContactApv: 0,
        countLeadsContactPlannedApv: 0,
        countLeadsWaitingForMeetingApv: 0,
        countLeadsMeetingPlannedApv: 0,
        countLeadsWaitingForPropositionApv: 0,
        countLeadsPropositionPlannedApv: 0,
        countLeadsWaitingForClosingApv: 0,
        countLeadsClosedWithoutSaleApv: 0,
        countLeadsClosedWithSaleApv: 0,
        countLeadsClosedWithSaleWasInterestedApv: 0,
        countLeadsClosedWithSaleWasInContactWithVendorApv: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv: 0,
        countLeadsPotentialSalesApv: 0,
        // Leads Vn
        countLeadsVn: 1,
        countLeadsUnassignedVn: 0,
        countLeadsAssignedVn: 1,
        countLeadsUntouchedVn: 1,
        countLeadsUntouchedOpenVn: 0,
        countLeadsUntouchedClosedVn: 1,
        countLeadsTouchedVn: 0,
        countLeadsTouchedOpenVn: 0,
        countLeadsTouchedClosedVn: 0,
        countLeadsTouchedClosedForInactivityVn: 0,
        countLeadsReactiveVn: 0,
        countLeadsWaitingForContactVn: 0,
        countLeadsContactPlannedVn: 0,
        countLeadsWaitingForMeetingVn: 0,
        countLeadsMeetingPlannedVn: 0,
        countLeadsWaitingForPropositionVn: 0,
        countLeadsPropositionPlannedVn: 0,
        countLeadsWaitingForClosingVn: 0,
        countLeadsClosedWithoutSaleVn: 1,
        countLeadsClosedWithSaleVn: 0,
        countLeadsClosedWithSaleWasInterestedVn: 0,
        countLeadsClosedWithSaleWasInContactWithVendorVn: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn: 0,
        countLeadsPotentialSalesVn: 1,
        // Leads Vo
        countLeadsVo: 0,
        countLeadsUnassignedVo: 0,
        countLeadsAssignedVo: 0,
        countLeadsUntouchedVo: 0,
        countLeadsUntouchedOpenVo: 0,
        countLeadsUntouchedClosedVo: 0,
        countLeadsTouchedVo: 0,
        countLeadsTouchedOpenVo: 0,
        countLeadsTouchedClosedVo: 0,
        countLeadsTouchedClosedForInactivityVo: 0,
        countLeadsReactiveVo: 0,
        countLeadsWaitingForContactVo: 0,
        countLeadsContactPlannedVo: 0,
        countLeadsWaitingForMeetingVo: 0,
        countLeadsMeetingPlannedVo: 0,
        countLeadsWaitingForPropositionVo: 0,
        countLeadsPropositionPlannedVo: 0,
        countLeadsWaitingForClosingVo: 0,
        countLeadsClosedWithoutSaleVo: 0,
        countLeadsClosedWithSaleVo: 0,
        countLeadsClosedWithSaleWasInterestedVo: 0,
        countLeadsClosedWithSaleWasInContactWithVendorVo: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo: 0,
        countLeadsPotentialSalesVo: 0,
        // Leads Vn/Vo (Unknown)
        countLeadsUnknown: 1,
        countLeadsUnassignedUnknown: 0,
        countLeadsAssignedUnknown: 1,
        countLeadsUntouchedUnknown: 1,
        countLeadsUntouchedOpenUnknown: 0,
        countLeadsUntouchedClosedUnknown: 1,
        countLeadsTouchedUnknown: 0,
        countLeadsTouchedOpenUnknown: 0,
        countLeadsTouchedClosedUnknown: 0,
        countLeadsTouchedClosedForInactivityUnknown: 0,
        countLeadsReactiveUnknown: 0,
        countLeadsWaitingForContactUnknown: 0,
        countLeadsContactPlannedUnknown: 0,
        countLeadsWaitingForMeetingUnknown: 0,
        countLeadsMeetingPlannedUnknown: 0,
        countLeadsWaitingForPropositionUnknown: 0,
        countLeadsPropositionPlannedUnknown: 0,
        countLeadsWaitingForClosingUnknown: 0,
        countLeadsClosedWithoutSaleUnknown: 1,
        countLeadsClosedWithSaleUnknown: 0,
        countLeadsClosedWithSaleWasInterestedUnknown: 0,
        countLeadsClosedWithSaleWasInContactWithVendorUnknown: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown: 0,
        countLeadsPotentialSalesUnknown: 1,
      },
      '2018-7': {
        _id: '5a2821c9590aaa1300cd1a78',
        followedGarageId: 0,
        countLeads: 1,
        countLeadsUnassigned: 0,
        countLeadsAssigned: 0,
        countLeadsUntouched: 1,
        countLeadsUntouchedOpen: 0,
        countLeadsUntouchedClosed: 1,
        countLeadsTouched: 0,
        countLeadsTouchedOpen: 0,
        countLeadsTouchedClosed: 0,
        countLeadsTouchedClosedForInactivity: 0,
        countLeadsReactive: 0,
        countLeadsWaitingForContact: 0,
        countLeadsContactPlanned: 0,
        countLeadsWaitingForMeeting: 0,
        countLeadsMeetingPlanned: 0,
        countLeadsWaitingForProposition: 0,
        countLeadsPropositionPlanned: 0,
        countLeadsWaitingForClosing: 0,
        countLeadsClosedWithoutSale: 1,
        countLeadsClosedWithSale: 0,
        countLeadsClosedWithSaleWasInterested: 0,
        countLeadsClosedWithSaleWasInContactWithVendor: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness: 0,
        countLeadsPotentialSales: 1,
        // Leads APV
        countLeadsApv: 0,
        countLeadsUnassignedApv: 0,
        countLeadsAssignedApv: 0,
        countLeadsUntouchedApv: 0,
        countLeadsUntouchedOpenApv: 0,
        countLeadsUntouchedClosedApv: 0,
        countLeadsTouchedApv: 0,
        countLeadsTouchedOpenApv: 0,
        countLeadsTouchedClosedApv: 0,
        countLeadsTouchedClosedForInactivityApv: 0,
        countLeadsReactiveApv: 0,
        countLeadsWaitingForContactApv: 0,
        countLeadsContactPlannedApv: 0,
        countLeadsWaitingForMeetingApv: 0,
        countLeadsMeetingPlannedApv: 0,
        countLeadsWaitingForPropositionApv: 0,
        countLeadsPropositionPlannedApv: 0,
        countLeadsWaitingForClosingApv: 0,
        countLeadsClosedWithoutSaleApv: 0,
        countLeadsClosedWithSaleApv: 0,
        countLeadsClosedWithSaleWasInterestedApv: 0,
        countLeadsClosedWithSaleWasInContactWithVendorApv: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv: 0,
        countLeadsPotentialSalesApv: 0,
        // Leads Vn
        countLeadsVn: 1,
        countLeadsUnassignedVn: 0,
        countLeadsAssignedVn: 0,
        countLeadsUntouchedVn: 1,
        countLeadsUntouchedOpenVn: 0,
        countLeadsUntouchedClosedVn: 1,
        countLeadsTouchedVn: 0,
        countLeadsTouchedOpenVn: 0,
        countLeadsTouchedClosedVn: 0,
        countLeadsTouchedClosedForInactivityVn: 0,
        countLeadsReactiveVn: 0,
        countLeadsWaitingForContactVn: 0,
        countLeadsContactPlannedVn: 0,
        countLeadsWaitingForMeetingVn: 0,
        countLeadsMeetingPlannedVn: 0,
        countLeadsWaitingForPropositionVn: 0,
        countLeadsPropositionPlannedVn: 0,
        countLeadsWaitingForClosingVn: 0,
        countLeadsClosedWithoutSaleVn: 1,
        countLeadsClosedWithSaleVn: 0,
        countLeadsClosedWithSaleWasInterestedVn: 0,
        countLeadsClosedWithSaleWasInContactWithVendorVn: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn: 0,
        countLeadsPotentialSalesVn: 1,
        // Leads Vo
        countLeadsVo: 0,
        countLeadsUnassignedVo: 0,
        countLeadsAssignedVo: 0,
        countLeadsUntouchedVo: 0,
        countLeadsUntouchedOpenVo: 0,
        countLeadsUntouchedClosedVo: 0,
        countLeadsTouchedVo: 0,
        countLeadsTouchedOpenVo: 0,
        countLeadsTouchedClosedVo: 0,
        countLeadsTouchedClosedForInactivityVo: 0,
        countLeadsReactiveVo: 0,
        countLeadsWaitingForContactVo: 0,
        countLeadsContactPlannedVo: 0,
        countLeadsWaitingForMeetingVo: 0,
        countLeadsMeetingPlannedVo: 0,
        countLeadsWaitingForPropositionVo: 0,
        countLeadsPropositionPlannedVo: 0,
        countLeadsWaitingForClosingVo: 0,
        countLeadsClosedWithoutSaleVo: 0,
        countLeadsClosedWithSaleVo: 0,
        countLeadsClosedWithSaleWasInterestedVo: 0,
        countLeadsClosedWithSaleWasInContactWithVendorVo: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo: 0,
        countLeadsPotentialSalesVo: 0,
        // Leads Vn/Vo (Unknown)
        countLeadsUnknown: 0,
        countLeadsUnassignedUnknown: 0,
        countLeadsAssignedUnknown: 0,
        countLeadsUntouchedUnknown: 0,
        countLeadsUntouchedOpenUnknown: 0,
        countLeadsUntouchedClosedUnknown: 0,
        countLeadsTouchedUnknown: 0,
        countLeadsTouchedOpenUnknown: 0,
        countLeadsTouchedClosedUnknown: 0,
        countLeadsTouchedClosedForInactivityUnknown: 0,
        countLeadsReactiveUnknown: 0,
        countLeadsWaitingForContactUnknown: 0,
        countLeadsContactPlannedUnknown: 0,
        countLeadsWaitingForMeetingUnknown: 0,
        countLeadsMeetingPlannedUnknown: 0,
        countLeadsWaitingForPropositionUnknown: 0,
        countLeadsPropositionPlannedUnknown: 0,
        countLeadsWaitingForClosingUnknown: 0,
        countLeadsClosedWithoutSaleUnknown: 0,
        countLeadsClosedWithSaleUnknown: 0,
        countLeadsClosedWithSaleWasInterestedUnknown: 0,
        countLeadsClosedWithSaleWasInContactWithVendorUnknown: 0,
        countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown: 0,
        countLeadsPotentialSalesUnknown: 0,
      },
    };

    const currentYear = new Date().getFullYear();
    /**
     * 1, loop since 2017 to current year
     * 2, loop every month
     * 3, get result from kpiAggregator with function aggregateLeadsKpi()
     * 4, check if the result is not negative
     * 5, check if the result is the same above if the aggregate was change
     */
    for (let y = 2017; y <= currentYear; y++) {
      for (let m = 0; m <= 11; m++) {
        let res = null;
        const time = new Date(y, m, 2);
        const periods = kpiPeriods.getPeriodsAffectedByGivenDate(time);
        for (const period of periods) {
          res = await aggregateLeadsKpi(app, { period });
        }
        if (res.length > 0) {
          // expect not find negative value !
          for (const key of Object.keys(res[0])) {
            if (key !== '_id') {
              expect(res[0][key]).to.above(-1);
            }
          }
          // expect find same value above
          if (y === 2018 && m === 7 && data.garageId === '5a2821c9590aaa1300cd1a78') {
            for (const key of Object.keys(res[0])) {
              expect(res[0][key], `${m}/${y} : ${key}`).equal(expectResult['2018-7'][key]);
            }
          }
          if (y === 2019 && m === 9 && data.garageId === '5a2821c9590aaa1300cd1a78') {
            for (const key of Object.keys(res[0])) {
              expect(res[0][key], `${m}/${y} : ${key}`).equal(expectResult['2019-9'][key]);
            }
          }
        }
      }
    }
  });

  it('it should calculte Erep KPI from dump datas', async () => {
    await app.restore(path.resolve(`${__dirname}/dataSourceGoogle.dump`));
    const data = await app.models.Data.findOne({ garageId: '5cc714d29bf17500158e48d6' });

    const expectResult = {
      '2018-5': {
        _id: '5cc714d29bf17500158e48d6',

        erepCountReviews: 4,
        erepCountHasRating: 4,
        erepCountHasRecommendation: 0,
        erepSumRating: 24,
        erepCountPromoters: 0,
        erepCountDetractors: 4,
        erepCountPassives: 0,
        erepCountRecommend: 0,
        erepCountDetractorsWithoutResponse: 2,

        erepCountReviewsGoogle: 4,
        erepCountHasRatingGoogle: 4,
        erepSumRatingGoogle: 24,
        erepCountPromotersGoogle: 0,
        erepCountDetractorsGoogle: 4,
        erepCountDetractorsWithoutResponseGoogle: 2,

        erepCountReviewsFacebook: 0,
        erepCountHasRecommendationFacebook: 0,
        erepCountPromotersFacebook: 0,
        erepCountDetractorsFacebook: 0,
        erepCountRecommendFacebook: 0,
        erepCountDetractorsWithoutResponseFacebook: 0,

        erepCountReviewsPagesJaunes: 0,
        erepCountHasRatingPagesJaunes: 0,
        erepSumRatingPagesJaunes: 0,
        erepCountPromotersPagesJaunes: 0,
        erepCountDetractorsPagesJaunes: 0,
        erepCountDetractorsWithoutResponsePagesJaunes: 0,
      },
      '2019-9': {
        _id: '5cc714d29bf17500158e48d6',

        erepCountReviews: 2,
        erepCountHasRating: 2,
        erepCountHasRecommendation: 0,
        erepSumRating: 12,
        erepCountPromoters: 0,
        erepCountDetractors: 2,
        erepCountPassives: 0,
        erepCountRecommend: 0,
        erepCountDetractorsWithoutResponse: 0,

        erepCountReviewsGoogle: 2,
        erepCountHasRatingGoogle: 2,
        erepSumRatingGoogle: 12,
        erepCountPromotersGoogle: 0,
        erepCountDetractorsGoogle: 2,
        erepCountDetractorsWithoutResponseGoogle: 0,

        erepCountReviewsFacebook: 0,
        erepCountHasRecommendationFacebook: 0,
        erepCountRecommendFacebook: 0,
        erepCountPromotersFacebook: 0,
        erepCountDetractorsFacebook: 0,
        erepCountDetractorsWithoutResponseFacebook: 0,

        erepCountReviewsPagesJaunes: 0,
        erepCountHasRatingPagesJaunes: 0,
        erepSumRatingPagesJaunes: 0,
        erepCountPromotersPagesJaunes: 0,
        erepCountDetractorsPagesJaunes: 0,
        erepCountDetractorsWithoutResponsePagesJaunes: 0,
      },
    };

    const currentYear = new Date().getFullYear();
    /**
     * 1, loop since 2017 to current year
     * 2, loop every month
     * 3, get result from kpiAggregator with function aggregateErepKpi()
     * 4, check if the result is not negative
     * 5, check if the result is the same above if the aggregate was change
     */
    for (let y = 2017; y <= currentYear; y++) {
      for (let m = 0; m <= 11; m++) {
        let res = null;
        const time = new Date(y, m, 2);
        const periods = kpiPeriods.getPeriodsAffectedByGivenDate(time);
        for (const period of periods) {
          res = await aggregateErepKpi(app, { period });
        }

        if (res.length > 0) {
          // expect not find negative value !
          for (const key of Object.keys(res[0])) {
            if (!['_id'].includes(key)) {
              expect(res[0][key]).to.above(-1);
            }
          }
          // expect find same value above
          if (y === 2018 && m === 5 && data.garageId === '5cc714d29bf17500158e48d6') {
            for (const key of Object.keys(res[0])) {
              expect(
                res[0][key],
                `for 2018/05, key: ${key}, expected: ${expectResult['2018-5'][key]}, actual: ${res[0][key]}`
              ).equal(expectResult['2018-5'][key]);
            }
          }
          if (y === 2019 && m === 9 && data.garageId === '5cc714d29bf17500158e48d6') {
            for (const key of Object.keys(res[0])) {
              expect(
                res[0][key],
                `for 2019/09, key: ${key}, expected: ${expectResult['2019-9'][key]}, actual: ${res[0][key]}`
              ).equal(expectResult['2019-9'][key]);
            }
          }
        }
      }
    }
  });
});
