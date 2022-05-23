const { ObjectId } = require('mongodb');
const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const GarageTypes = require('../../common/models/garage.type');

const { expect } = chai;
const app = new TestApp();

describe('Data get contacts list', () => {

  const query = `query dataGetContactsList_bdeJBcDFbaeFccAJDcAJBFfEEDAaCCcb ($dataGetContactsList0periodId: String!,$dataGetContactsList0type: String,$dataGetContactsList0garageId: [String],$dataGetContactsList0frontDeskUserName: String,$dataGetContactsList0search: String,$dataGetContactsList0limit: Int,$dataGetContactsList0skip: Int,$dataGetContactsList0contactsOrder: String!,$dataGetContactsList0cockpitType: String) {
      dataGetContactsList (periodId: $dataGetContactsList0periodId,type: $dataGetContactsList0type,garageId: $dataGetContactsList0garageId,frontDeskUserName: $dataGetContactsList0frontDeskUserName,search: $dataGetContactsList0search,limit: $dataGetContactsList0limit,skip: $dataGetContactsList0skip,contactsOrder: $dataGetContactsList0contactsOrder,cockpitType: $dataGetContactsList0cockpitType) { list {
          id
          customerTitle
          customerFullName
          customerPhone
          customerEmail
          garageProvidedCustomerId
          serviceProvidedAt
          garagePublicDisplayName
          garageType
          type
          customerCampaignContactStatus
          explainCampaignContactStatus
          customerEmailStatus
          customerPhoneStatus
          customerUnsubscribedByEmail
          customerUnsubscribedByPhone
          explainEmailStatus
          explainPhoneStatus
          isCampaignContactedByEmail
          isCampaignContactedByPhone
          campaignFirstSendAt
          isApv
          isVn
          isVo
          serviceFrontDeskUserName
          garageSubscriptions {
            Maintenance
            NewVehicleSale
            UsedVehicleSale
            Lead
            EReputation
          }
        }
        hasMore
      }
     }`;

  beforeEach(async () => {
    await app.reset();
  });

  it('it should get contactList from apollo request', async () => {
    await app.addUser({});
    await app.addGarage({
      subscriptions: {
        priceValidated: true,
        Maintenance: { enabled: true },
        NewVehicleSale: { enabled: false },
        UsedVehicleSale: { enabled: false },
        Lead: { enabled: false },
        EReputation: { enabled: false },
      },
    });
    const user = await app.models.User.findOne();
    const garage = await app.models.Garage.findOne();
    await app.models.User.getMongoConnector().updateOne(
      { _id: user.id },
      { $set: { garageIds: [ObjectId(garage.id)] } }
    );
    await Promise.all(
      Array(3)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            garageId: garage.id,
            type: 'Maintenance',
            campaign: {
              status: 'Blocked',
              contactStatus: {
                hasBeenContactedByPhone: false,
                hasBeenContactedByEmail: false,
                hasOriginalBeenContactedByPhone: false,
                hasOriginalBeenContactedByEmail: false,
                status: 'Blocked',
                phoneStatus: 'Valid',
                emailStatus: 'Wrong',
                previouslyContactedByPhone: false,
                previouslyContactedByEmail: false,
                previouslyDroppedEmail: true,
                previouslyDroppedPhone: false,
                previouslyUnsubscribedByEmail: true,
                previouslyUnsubscribedByPhone: false,
                previouslyComplainedByEmail: false,
              },
            },
            sourceType: 'DataFile',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await app.models.Data.create(data);
        })
    );
    const variablesApollo = {
      dataGetContactsList0cockpitType: 'Dealership',
      dataGetContactsList0contactsOrder: 'DESC',
      dataGetContactsList0garageId: null,
      dataGetContactsList0limit: 10,
      dataGetContactsList0periodId: 'CURRENT_YEAR',
      dataGetContactsList0search: '',
      dataGetContactsList0skip: 0,
      dataGetContactsList0type: null,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.userId);

    expect(res.data.dataGetContactsList.list[0].garagePublicDisplayName).equal('Garagescore');
    expect(res.data.dataGetContactsList.list[0].isApv).equal(true);
    expect(res.data.dataGetContactsList.list[0].garageSubscriptions.Maintenance).equal(true);
    expect(res.data.dataGetContactsList.hasMore).equal(false);
  });


  it('it should get contactList from apollo request', async () => {
    await app.addUser({});
    await app.addGarage({
      subscriptions: {
        priceValidated: true,
        Maintenance: { enabled: true },
        NewVehicleSale: { enabled: false },
        UsedVehicleSale: { enabled: false },
        Lead: { enabled: false },
        EReputation: { enabled: false },
      },
    });
    const user = await app.models.User.findOne();
    const garage = await app.models.Garage.findOne();
    await app.models.User.getMongoConnector().updateOne(
      { _id: user.id },
      { $set: { garageIds: [ObjectId(garage.id)] } }
    );
    await Promise.all(
      Array(3)
        .fill(null)
        .map(async () => {
          const data = await app.models.Data.init(garage.getId(), {
            garageId: garage.id,
            type: 'Maintenance',
            campaign: {
              status: 'Blocked',
              contactStatus: {
                hasBeenContactedByPhone: false,
                hasBeenContactedByEmail: false,
                hasOriginalBeenContactedByPhone: false,
                hasOriginalBeenContactedByEmail: false,
                status: 'Blocked',
                phoneStatus: 'Valid',
                emailStatus: 'Wrong',
                previouslyContactedByPhone: false,
                previouslyContactedByEmail: false,
                previouslyDroppedEmail: true,
                previouslyDroppedPhone: false,
                previouslyUnsubscribedByEmail: true,
                previouslyUnsubscribedByPhone: false,
                previouslyComplainedByEmail: false,
              },
            },
            sourceType: 'DataFile',
            garageType: GarageTypes.DEALERSHIP,
            raw: {},
          });
          data.set('service.providedAt', new Date());
          await app.models.Data.create(data);
        })
    );
    const variablesApollo = {
      dataGetContactsList0cockpitType: 'Dealership',
      dataGetContactsList0contactsOrder: 'DESC',
      dataGetContactsList0garageId: [garage.id.toString()],
      dataGetContactsList0limit: 10,
      dataGetContactsList0periodId: 'CURRENT_YEAR',
      dataGetContactsList0search: '',
      dataGetContactsList0skip: 0,
      dataGetContactsList0type: null,
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.userId);

    expect(res.data.dataGetContactsList.list[0].garagePublicDisplayName).equal('Garagescore');
    expect(res.data.dataGetContactsList.list[0].isApv).equal(true);
    expect(res.data.dataGetContactsList.list[0].garageSubscriptions.Maintenance).equal(true);
    expect(res.data.dataGetContactsList.hasMore).equal(false);
  });


  it('it should return Promise.reject error', async () => {
    await app.addUser({});
    const user = await app.models.User.findOne();
    const query = `query dataGetContactsList_bdeJBcDFbaeFccAJDcAJBFfEEDAaCCcb ($dataGetContactsList0periodId: String!,$dataGetContactsList0type: String,$dataGetContactsList0garageId: [String],$dataGetContactsList0frontDeskUserName: String,$dataGetContactsList0search: String,$dataGetContactsList0limit: Int,$dataGetContactsList0skip: Int,$dataGetContactsList0contactsOrder: String!,$dataGetContactsList0cockpitType: String) {
        dataGetContactsList (periodId: $dataGetContactsList0periodId,type: $dataGetContactsList0type,garageId: $dataGetContactsList0garageId,frontDeskUserName: $dataGetContactsList0frontDeskUserName,search: $dataGetContactsList0search,limit: $dataGetContactsList0limit,skip: $dataGetContactsList0skip,contactsOrder: $dataGetContactsList0contactsOrder,cockpitType: $dataGetContactsList0cockpitType)
        {
          list {
            id
          }
          hasMore
        }
      }`;
    const variablesApollo = {
      dataGetContactsList0cockpitType: 'Dealership',
      dataGetContactsList0contactsOrder: 'DESC',
      dataGetContactsList0garageId: 'vjvxS37japrkTfKyR9L3Lh6h',
      dataGetContactsList0limit: 10,
      dataGetContactsList0periodId: 'CURRENT_YEAR',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.userId);
    expect(/Not authorized to access garage/.test(res.errors.toString())).equal(true);
  });
});
