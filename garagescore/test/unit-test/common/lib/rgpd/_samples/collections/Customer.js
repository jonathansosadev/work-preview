const { ObjectId } = require('mongodb');
const ISODate = (date) => new Date(date);

module.exports = {
  _id: ObjectId('618150b25893a870d229844c'),
  garageId: ObjectId('577a30d774616c1a0056c263'),
  email: 'uneadressemailsuperoriginale@gmail.com',
  phone: '+33612345678',
  fullName: 'Simon Ménard',
  history: [],
  dataIds: [ObjectId('617ab480efbd732db48b7330')],
  index: [
    {
      k: 'garageId',
      v: ObjectId('577a30d774616c1a0056c263'),
    },
    {
      k: 'email',
      v: 'uneadressemailsuperoriginale@gmail.com',
    },
    {
      k: 'hasEmail',
      v: true,
    },
    {
      k: 'phone',
      v: '+33612345678',
    },
    {
      k: 'hasPhone',
      v: true,
    },
    {
      k: 'fullName',
      v: 'Simon ménard',
    },
    {
      k: 'd617ab480efbd732db48b7330',
      v: true,
    },
  ],
  createdAt: ISODate('2021-11-02T14:52:34.894Z'),
  updatedAt: ISODate('2021-11-02T14:52:34.894Z'),
  status: 'New',
  emailList: ['uneadressemailsuperoriginale@gmail.com'],
  phoneList: ['+33612345678'],
  unsubscribed: false,
  leads: [
    {
      leadType: 'Maintenance',
      declaredAt: ISODate('2021-10-28T14:32:32.505Z'),
      source: 'MotorShow',
      dataId: ObjectId('617ab480efbd732db48b7330'),
      plate: '',
    },
  ],
  automationCampaignsEvents: [],
  automationCampaigns: [],
};
