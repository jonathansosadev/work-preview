/**
 * Lancer d'abord scripts/maintenance/data/init-data-migration.mongo.js
 * Corrige les champs $vehicle.registrationDate.value et $$vehicle.registrationDate.original
 */
var convertDate = function (d) {
  return new Date(d);
};
var $function = { body: convertDate, args: ['$vehicle.registrationDate.value'], lang: 'js' };

db.getCollection('tmpDataFix')
  .find({ status: 'WAITING' })
  .sort({ '_id.gte': 1 })
  .forEach((bucket) => {
    var startTime = Date.now();
    var { lte: $lte, gte: $gte } = bucket._id;
    var $match = {
      _id: $lte ? { $lte, $gte } : { $gte },
      'vehicle.registrationDate.value': { $exists: true },
    };
    db.datas.aggregate([
      { $match },
      { $project: { vehicle: 1 } }, // we need the complete field for the merge
      {
        $addFields: {
          'vehicle.registrationDate.value': { $function },
          'vehicle.registrationDate.original': { $function },
        },
      },
      { $merge: 'datas' },
    ]);
    db.tmpDataFix.updateOne(
      { _id: bucket._id },
      { $set: { status: 'COMPLETE', completedAt: new Date(), completionLogs: { duration: Date.now() - startTime } } }
    );
  });
