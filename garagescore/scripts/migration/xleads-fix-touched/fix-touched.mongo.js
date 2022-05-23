var totalModified = 0;
var requests = [];
const cursor = db.getCollection('datas').find({
  'leadTicket.createdAt': { $gte: new ISODate('2020-05-09T00:00:31Z') },
  'leadTicket.crossLeadData': true,
  'leadTicket.touched': true,
  'leadTicket.reactive': true,
});
cursor.forEach((data) => {
  let reactive = false;
  let touched = false;
  for (let i = 0; i < data.leadTicket.actions.length && !touched; i++) {
    const action = data.leadTicket.actions[i];
    if (
      [
        'customerCall',
        'reminder',
        'meeting',
        'proposition',
        'customerDirectExchange',
        'garageSecondVisit',
        'investigation',
        'constructorQuery',
        'dataModification',
      ].includes(action.name)
    ) {
      touched = true;
      if (action.createdAt - data.leadTicket.createdAt < 1000 * 60 * 60 * 24) reactive = true;
    }
  }

  if (data.leadTicket.touched !== touched || data.leadTicket.reactive !== reactive) {
    requests.push({
      updateOne: {
        filter: { _id: data._id },
        update: { $set: { 'leadTicket.touched': touched, 'leadTicket.reactive': reactive } },
      },
    });
    if (requests.length >= 200) {
      db.getCollection('datas').bulkWrite(requests);
      totalModified += requests.length;
      requests = [];
    }
  }
});
if (requests.length > 0) db.getCollection('datas').bulkWrite(requests);
totalModified += requests.length;
print(totalModified);
