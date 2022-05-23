const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const { ObjectId } = require('mongodb');
const GarageTypes = require('../../common/models/garage.type');
const DataTypes = require('../../common/models/data/type/data-types');
const GarageHistoryPeriods = require('../../common/models/garage-history.period');
const UnsatisfiedFollowupStatus = require('../../common/models/data/type/unsatisfied-followup-status');
const SourceTypes = require('../../common/models/data/type/source-types');
const ModerationStatuses = require('../../common/models/data/type/moderation-status');
const DataBuilder = require('../../common/lib/test/test-instance-factory/data-builder');
const UserAuthorization = require('../../common/models/user-autorization');

const query = `query dataGetReviewsList($limit: Int!, $before: String, $periodId: String!, $cockpitType: String!, $search: String, $garageId: [String], $type: String, $surveySatisfactionLevel: String, $publicReviewCommentStatus: String, $followupUnsatisfiedStatus: String, $followupLeadStatus: String, $dataId: ID, $frontDeskUserName: String) {
    dataGetReviewsList(limit: $limit, before: $before, periodId: $periodId, cockpitType: $cockpitType, search: $search, garageId: $garageId, type: $type, surveySatisfactionLevel: $surveySatisfactionLevel, publicReviewCommentStatus: $publicReviewCommentStatus, followupUnsatisfiedStatus: $followupUnsatisfiedStatus, followupLeadStatus: $followupLeadStatus, dataId: $dataId, frontDeskUserName: $frontDeskUserName) {
      datas {
        id
        type
        followupUnsatisfiedStatus
        garage {
          id
          type
          ratingType
          publicDisplayName
        }
        review {
          createdAt
          fromCockpitContact
          followupChangeEvaluation
          comment {
            text
            status
            rejectedReason
          }
          reply {
            text
            status
            rejectedReason
          }
          rating {
            value
          }
          followupUnsatisfiedComment {
            text
          }
        }
        vehicle {
          model {
            value
          }
          make {
            value
          }
          plate {
            value
          }
          vin {
            value
          }
        }
        isApv
        isVn
        isVo
        lead {
          potentialSale
          timing
          saleType
          knowVehicle
          brands
          bodyType
          energyType
          cylinder
          tradeIn
          financing
          type
          conversion {
            sale {
              type
              vehicle {
                model {
                  value
                }
                make {
                  value
                }
                plate {
                  value
                }
              }
              service {
                providedAt
                frontDeskUserName
              }
            }
            tradeIn {
              customer {
                fullName {
                  value
                }
                contact {
                  mobilePhone {
                    value
                  }
                  email {
                    value
                  }
                }
              }
              vehicle {
                make {
                  value
                }
                model {
                  value
                }
                plate {
                  value
                }
              }
              service {
                providedAt
                frontDeskUserName
              }
            }
          }
        }
        service {
          frontDeskUserName
          providedAt
          frontDeskCustomerId
        }
        leadTicket {
          followup {
            recontacted
            satisfied
            satisfiedReasons
            notSatisfiedReasons
            appointment
          }
        }
        customer {
          fullName {
            value
          }
          city {
            value
          }
          contact {
            email {
              value
            }
            mobilePhone {
              value
            }
          }
        }
        unsatisfied {
          isRecontacted
          criteria {
            label
            values
          }
        }
        surveyFollowupUnsatisfied {
          sendAt
          firstRespondedAt
        }
        surveyFollowupLead {
          sendAt
          firstRespondedAt
        }
      }
      hasMore
      cursor
    }
}`;

let garage;
let user;
let data;
let dataLead;
let dataTradeIn;

const checkPropertiesValues = (objToMatch, targetObj) => {
  for (const prop in targetObj) {
    if (!Object.hasOwnProperty.call(objToMatch, prop)) {
      // for calculated values, you need to check each of them
      continue;
    }
    if (ObjectId.isValid(objToMatch[prop])) {
      expect(objToMatch[prop].toString()).to.be.equal(targetObj[prop].toString());
      continue;
    }
    if (typeof targetObj[prop] !== 'object') {
      expect(objToMatch[prop]).to.be.equal(targetObj[prop]);
      continue;
    }
    checkPropertiesValues(objToMatch[prop], targetObj[prop]);
  }
};
describe('Apollo::dataGetReviewsList', () => {
  beforeEach(async () => {
    await app.reset();
    garage = await app.addGarage({ ratingType: 'rating' });
    user = { authorization: { [UserAuthorization.ACCESS_TO_COCKPIT]: true } };
    user.garageIds = [garage.getId().toString()];
    user = await app.addUser(user);

    dataLead = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .type(DataTypes.USED_VEHICLE_SALE)
      .source(SourceTypes.DATAFILE)
      .vehicle({
        make: {
          value: 'Renault',
          original: 'Renault',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'LL00',
          original: 'LL00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'LL-000-NN',
          original: 'LL-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
      })
      .service({
        providedAt: '2017-08-22T15:00:00',
        frontDeskUserName: 'Test LEAD',
      })
      .shouldSurfaceInStatistics(true)
      .create();

    dataTradeIn = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.AGENT)
      .type(DataTypes.USED_VEHICLE_SALE)
      .vehicle({
        make: {
          value: 'Audi',
          original: 'Audi',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'TT00',
          original: 'TT00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'TT-000-NN',
          original: 'TT-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
      })
      .customerField('fullName', { value: 'Customer test' })
      .mobilePhone({ value: '0797797977' })
      .email({ value: 'test@test.com' })
      .service({
        providedAt: '2016-03-22T15:00:00',
        frontDeskUserName: 'Test TradeIn',
      })
      .shouldSurfaceInStatistics(true)
      .create();

    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .garageType() // default DEALERSHIP
      .source(SourceTypes.DATAFILE)
      .type(DataTypes.USED_VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: '2018-09-22T15:00:00',
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .email({ value: 'test@test.fr' })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
  });

  it('should return a reviews list for one garage', async () => {
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      cockpitType: GarageTypes.DEALERSHIP,
      garageId: [garage.getId().toString()],
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });


  it('should return a reviews list for a list of garages', async () => {
    // apollo variables
    let newGarage = await app.addGarage({ ratingType: 'rating' });
    user = { authorization: { [UserAuthorization.ACCESS_TO_COCKPIT]: true } };
    user.garageIds = [garage.getId().toString(), newGarage.getId().toString()];
    user = await app.addUser(user);
    var data2 = await new DataBuilder(app)
      .garage(newGarage.getId().toString())
      .garageType() // default DEALERSHIP
      .source(SourceTypes.DATAFILE)
      .type(DataTypes.USED_VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: '2018-09-22T15:00:00',
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .email({ value: 'test@test.fr' })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      cockpitType: GarageTypes.DEALERSHIP,
      garageId: [garage.getId().toString(),newGarage.getId().toString()],
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(variablesApollo.garageId.length);
    for (const e of datas) {
      expect(e).to.be.an('object');
      expect(e.isApv).to.be.false;
      expect(e.isVn).to.be.false;
      expect(e.review.followupChangeEvaluation).to.be.equal('yes');
      if (data.id === e.id){
        checkPropertiesValues(data, e);
      }else if(data2.id === e.id) {
        checkPropertiesValues(data2, e);
      }
      if(garage.id === e.garage.id){
        checkPropertiesValues(garage, e.garage);
      }else if(newGarage.id === e.garage.id){
        checkPropertiesValues(newGarage, e.garage);
      }
      checkPropertiesValues(dataLead, e.lead.conversion.sale);
      checkPropertiesValues(dataTradeIn, e.lead.conversion.tradeIn);
    }
  });

  it('should return a reviews list', async () => {
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      cockpitType: GarageTypes.DEALERSHIP,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });

  it('should return a reviews list by cockpitType', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.USED_VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: '2018-09-22T15:00:00',
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
  it('should return a reviews list by periodId === LAST QUARTER', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.USED_VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });

  it('should return a reviews list by periodId', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.USED_VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
  it('should return a reviews list by dataId', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.USED_VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      dataId: data.id.toString(),
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
  it('should return a reviews list by type', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'Test test',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      type: DataTypes.VEHICLE_SALE,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
  it('should return a reviews list by frontDeskUserName', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'John',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      frontDeskUserName: 'John',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
  it('should return a reviews list by followupLeadStatus', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
        isConverted: true,
      })
      .leadTicket()
      .review()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'John',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      followupLeadStatus: 'LeadConverted',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
  it('should return a reviews list by followupUnsatisfiedStatus', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .surveyFollowupUnsatisfied()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(5)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'John',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      followupUnsatisfiedStatus: UnsatisfiedFollowupStatus.NEW_UNSATISFIED,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });

  it('should return a reviews list by publicReviewCommentStatus', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .surveyFollowupUnsatisfied()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(7)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'John',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      publicReviewCommentStatus: ModerationStatuses.APPROVED,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });

  it('should return a reviews list by surveySatisfactionLevel', async () => {
    data = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType(GarageTypes.MOTORBIKE_DEALERSHIP) // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .surveyFollowupUnsatisfied()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(9)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'John',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.MOTORBIKE_DEALERSHIP,
      surveySatisfactionLevel: 'Promoter',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });

  it('should return a reviews list by garageId', async () => {
    let newGarage = await app.addGarage({ ratingType: 'rating' });
    user = { authorization: { [UserAuthorization.ACCESS_TO_COCKPIT]: true } };
    user.garageIds = [garage.getId().toString(), newGarage.getId().toString()];
    user = await app.addUser(user);
    data = await new DataBuilder(app)
      .garage(newGarage.getId().toString())
      .source(SourceTypes.DATAFILE)
      .garageType() // default DEALERSHIP
      .type(DataTypes.VEHICLE_SALE)
      .lead({
        potentialSale: true,
        timing: 'ShortTerm',
        saleType: 'NewVehicleSale',
        knowVehicle: false,
        bodyType: ['suv'],
        energyType: ['unknown'],
        financing: 'leasing',
        type: 'Interested',
        convertedTradeInDataId: dataTradeIn.id.toString(),
        convertedSaleDataId: dataLead.id.toString(),
        isConvertedToSale: true,
        isConvertedToTradeIn: true,
      })
      .leadTicket()
      .review()
      .surveyFollowupUnsatisfied()
      .reviewFollowupUnsatisfiedComment('una review uns comment')
      .reviewReply()
      .reviewComment('una commento')
      .reviewRating(9)
      .vehicle({
        make: {
          value: 'Volvo',
          original: 'Volvo',
          isSyntaxOK: true,
          isEmpty: false,
        },
        model: {
          value: 'XXOO',
          original: 'XX00',
          isSyntaxOK: true,
          isEmpty: false,
        },
        plate: {
          value: 'XX-000-NN',
          original: 'XX-000-NN',
          isSyntaxOK: true,
          isEmpty: false,
        },
        vin: {
          isEmpty: true,
        },
      })
      .service({
        providedAt: new Date(),
        frontDeskUserName: 'John',
        frontDeskCustomerId: user.getId().toString(),
      })
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.LAST_QUARTER,
      cockpitType: GarageTypes.DEALERSHIP,
      garageId: [newGarage.id.toString()],
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.false;
    newGarage = await newGarage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(newGarage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });

  it('should return a reviews list by search', async () => {
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: GarageHistoryPeriods.ALL_HISTORY,
      cockpitType: GarageTypes.DEALERSHIP,
      search: 'test@test.fr',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    // result
    const { datas, hasMore } = res.data.dataGetReviewsList;
    expect(hasMore).to.be.false;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(1);
    expect(datas[0]).to.be.an('object');
    expect(datas[0].isApv).to.be.false;
    expect(datas[0].isVn).to.be.false;
    expect(datas[0].isVo).to.be.true;
    garage = await garage.getInstanceMongo({ id: '$_id', type: true, ratingType: true, publicDisplayName: true });
    expect(datas[0].review.followupChangeEvaluation).to.be.equal('yes');
    checkPropertiesValues(data, datas[0]);
    checkPropertiesValues(garage, datas[0].garage);
    checkPropertiesValues(dataLead, datas[0].lead.conversion.sale);
    checkPropertiesValues(dataTradeIn, datas[0].lead.conversion.tradeIn);
  });
});
