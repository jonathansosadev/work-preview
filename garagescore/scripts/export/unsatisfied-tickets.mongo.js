/** export the full tickets history */
//  mongo  heroku_6jk0qvwj --host ds051234-a2.mongolab.com --port 51234  -u uuu -p pppp < scripts/export/unsatisfied-tickets.mongo.js > out.csv
rs.slaveOk();
var users = {};
db.User.find({}, { email: 1, lastName: 1, firstName: 1 }).forEach((u) => {
  users[u._id.valueOf()] = u.email + ' ' + (u.firstName || '') + ' ' + (u.lastName || '');
});
var garages = {};
db.garages.find({}, { publicDisplayName: 1 }).forEach((g) => {
  garages[g._id.valueOf()] = g.publicDisplayName;
});

var csv = '';
db.getCollection('datas')
  .find(
    { 'unsatisfiedTicket.createdAt': { $gte: ISODate('2008-08-24 07:39:31.461Z') } },
    {
      id: 1,
      garageId: 1,
      'unsatisfiedTicket.createdAt': 1,
      'unsatisfiedTicket.status': 1,
      'unsatisfiedTicket.manager': 1,
    }
  )
  .forEach((r) => {
    var dd = r.unsatisfiedTicket.createdAt.getDate();
    var mm = r.unsatisfiedTicket.createdAt.getMonth() + 1;
    var yyyy = r.unsatisfiedTicket.createdAt.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    csv += `${dd}/${mm}/${yyyy};${r._id.valueOf()};${garages[r.garageId]} (${r.garageId});${
      r.unsatisfiedTicket.status
    };${users[r.unsatisfiedTicket.manager] || '-'}\n`;
  });
print(csv);
