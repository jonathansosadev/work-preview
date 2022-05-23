/** Create a collection tmpDataFix
 * Each document will give us a bucket of datas to process defined by gte _id and a lte _id 
 * You need then another script looping through tmpDataFix, processing each bucket after the other, like that:
 * 
 * db.getCollection('tmpDataFix').find({ status: 'WAITING' }) .sort({ '_id.gte': 1 }) .forEach((bucket) => {
    ....process
    db.tmpBuildVehicles.updateOne(
      { _id: bucket._id },
      { $set: { status: 'COMPLETE', completedAt: new Date(), completionLogs: { .... }, } }
    );
  });
*/

var bucketSize = 100000;
db.tmpDataFix.drop();
var firstDoc = db.datas.find().sort({ _id: 1 }).limit(1).toArray()[0];
var from = firstDoc._id;
var step = 0;
while (true) {
  var $match = { _id: { $gte: from } };
  var $sort = { _id: 1 };
  var data = db.datas
    .aggregate([{ $match }, { $sort }, { $skip: bucketSize - 1 }, { $limit: 2 }, { $project: { _id: true } }])
    .toArray();
  var gte = from;
  if (data.length < 2) {
    db.tmpDataFix.save({ _id: { gte, step }, status: 'WAITING' });
    break;
  } else {
    var lte = data[0]._id;
    from = data[1]._id;
    db.tmpDataFix.save({ _id: { gte, lte, step }, status: 'WAITING' });
    step++;
  }
}
