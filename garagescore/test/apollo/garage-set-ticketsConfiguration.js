const chai = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('Garage set ticketsConfiguration', () => {
  beforeEach(async function () {
    await testApp.reset();
    const garage = await testApp.addGarage({});
    await testApp.addUser({
      garageIds: [ObjectId(garage.id)],
      allGaragesAlerts: {
        UnsatisfiedMaintenance: true,
      },
    });
    await testApp.addUser({
      garageIds: [ObjectId(garage.id)],
      allGaragesAlerts: {
        UnsatisfiedMaintenance: false,
      },
    });
  });
  it('It should return error when updated ticketConfiguration', async () => {
    const user = await testApp.models.User.findOne();
    const garage = await testApp.models.Garage.findOne();
    const request = `
    mutation garageSetTicketsConfiguration ($garageSetTicketsConfiguration0garageId: String,$garageSetTicketsConfiguration0userId: String,$garageSetTicketsConfiguration0oldUserId: String,$garageSetTicketsConfiguration0alertType: String) {
      garageSetTicketsConfiguration (garageId: $garageSetTicketsConfiguration0garageId,userId: $garageSetTicketsConfiguration0userId,oldUserId: $garageSetTicketsConfiguration0oldUserId,alertType: $garageSetTicketsConfiguration0alertType) { 
        message
        status
      }
     }
    `;
    const variables = {
      garageSetTicketsConfiguration0alertType: 'Unsatisfied_Maintenance',
      garageSetTicketsConfiguration0garageId: garage.id.toString(),
      garageSetTicketsConfiguration0oldUserId: '6007eba44c99290004d2294d',
      garageSetTicketsConfiguration0userId: '6007eba44c99290004d2294c',
    };

    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    expect(res.data.garageSetTicketsConfiguration.status).equal('KO');
    expect(res.data.garageSetTicketsConfiguration.message).equal('Users is not part of the garage');
  });

  it('It should updated ticketConfiguration and User garages Alerts', async () => {
    const garage = await testApp.models.Garage.findOne();
    const [sendUser, user, newUser] = await testApp.models.User.find();
    const request = `
    mutation garageSetTicketsConfiguration ($garageSetTicketsConfiguration0garageId: String,$garageSetTicketsConfiguration0userId: String,$garageSetTicketsConfiguration0oldUserId: String,$garageSetTicketsConfiguration0alertType: String) {
      garageSetTicketsConfiguration (garageId: $garageSetTicketsConfiguration0garageId,userId: $garageSetTicketsConfiguration0userId,oldUserId: $garageSetTicketsConfiguration0oldUserId,alertType: $garageSetTicketsConfiguration0alertType) { 
        message
        status
      }
     }
    `;
    const variables = {
      garageSetTicketsConfiguration0alertType: 'Unsatisfied_Maintenance',
      garageSetTicketsConfiguration0garageId: garage.id.toString(),
      garageSetTicketsConfiguration0oldUserId: user.id.toString(),
      garageSetTicketsConfiguration0userId: newUser.id.toString(),
    };

    const res = await _sendQueryAs(testApp, request, variables, sendUser.userId);
    const { ticketsConfiguration } = await testApp.models.Garage.findOne();
    const [testUser, updatedUser, updatedNewUser] = await testApp.models.User.find();

    expect(res.data.garageSetTicketsConfiguration.status).equal('OK');
    // check if garage has new userId
    expect(ticketsConfiguration['Unsatisfied_Maintenance'].toString()).equal(updatedNewUser.id.toString());
    // check old status
    expect(user.allGaragesAlerts.UnsatisfiedMaintenance).equal(true);
    expect(newUser.allGaragesAlerts.UnsatisfiedMaintenance).equal(false);
    // check new status
    expect(updatedUser.allGaragesAlerts.UnsatisfiedMaintenance).equal(false);
    expect(updatedNewUser.allGaragesAlerts.UnsatisfiedMaintenance).equal(true);
  });

  it('should updated ticketConfiguration if no user is originaly assigned and User garages Alerts', async () => {
    const garage = await testApp.models.Garage.findOne();
    const [sendUser, newUser] = await testApp.models.User.find();
    const request = `
    mutation garageSetTicketsConfiguration ($garageSetTicketsConfiguration0garageId: String,$garageSetTicketsConfiguration0userId: String,$garageSetTicketsConfiguration0oldUserId: String,$garageSetTicketsConfiguration0alertType: String) {
      garageSetTicketsConfiguration (garageId: $garageSetTicketsConfiguration0garageId,userId: $garageSetTicketsConfiguration0userId,oldUserId: $garageSetTicketsConfiguration0oldUserId,alertType: $garageSetTicketsConfiguration0alertType) { 
        message
        status
      }
     }
    `;
    const variables = {
      garageSetTicketsConfiguration0alertType: 'Unsatisfied_Maintenance',
      garageSetTicketsConfiguration0garageId: garage.id.toString(),
      garageSetTicketsConfiguration0oldUserId: '',
      garageSetTicketsConfiguration0userId: newUser.id.toString(),
    };

    const res = await _sendQueryAs(testApp, request, variables, sendUser.userId);
    const { ticketsConfiguration } = await testApp.models.Garage.findOne();
    const [testUser, updatedUser] = await testApp.models.User.find();

    expect(res.data.garageSetTicketsConfiguration.status).equal('OK');
    // check if garage has new userId
    expect(ticketsConfiguration['Unsatisfied_Maintenance'].toString()).equal(updatedUser.id.toString());
    // check new status
    expect(updatedUser.allGaragesAlerts.UnsatisfiedMaintenance).equal(true);
  });
});
