const { ObjectId } = require('mongodb');
const ISODate = (date) => new Date(date);

module.exports = {
  _id: ObjectId('618150915893a870d229844a'),
  type: 'CAMPAIGN_EMAIL',
  from: 'survey@mg.garagescore.com',
  sender: 'Garage Dupont via GarageScore',
  to: 'uneadressemailsuperoriginale@gmail.com',
  overrideTo: 'next@garagescore.com',
  recipient: 'Jean Richard',
  payload: {
    key: 'maintenance_email_thanks_2',
    dataId: ObjectId('617ab480efbd732db48b7330'),
    garageId: '577a30d774616c1a0056c263', // Index doesn't exist, don't use a garageId filter
  },
  createdAt: ISODate('2021-11-02T14:52:01.433Z'),
  updatedAt: ISODate('2021-11-02T14:52:01.433Z'),
  status: 'Waiting',
  app_url: 'http://localhost:3001',
  sendAt: ISODate('2021-11-02T14:52:01.432Z'),
};
