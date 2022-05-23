/** Template to update the datas collection (mongo shell) */
/* eslint-disable */
var findQuery = {};
// expl:
// var findQuery = {'lead.reportedAt': { $gt: ISODate("2000-01-01T00:00:00.000Z")}}
var setMethod = (data) => {};
// expl:
// var setMethod = (data) => {
//  var lead = data.lead
//  lead.reportedAt = data.survey.firstRespondedAt
//  return { lead: lead }
//}

var cursor = db.datas.find(findQuery);
var requests = [];
var debugCount = 0;
cursor.forEach((data) => {
  requests.push({
    updateOne: {
      filter: { _id: data._id },
      update: { $set: setMethod(data) },
    },
  });
  if (requests.length === 500) {
    //Execute per 500 operations and re-init
    db.datas.bulkWrite(requests);
    requests = [];
    debugCount += 500;
  }
});

if (requests.length > 0) {
  db.datas.bulkWrite(requests);
}
print(debugCount);
