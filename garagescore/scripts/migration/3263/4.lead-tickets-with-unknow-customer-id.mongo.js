/**
 * Vérifie sur un échantillon de garage que la migration s'est bien passée
 */
var garage = null; //'5b4cbe85bb59c30013f3d8aa';//'582ac33146b84a1a00752319';
var sampleSize = 300;
var $match = garage ? { _id: ObjectId(garage) } : { 'subscriptions.Automation.enabled': true };
var samples = db.garages
  .aggregate([{ $match }, { $sample: { size: sampleSize } }, { $project: { _id: 1 } }])
  .toArray()
  .map((g) => g._id.valueOf());
var ticketsCount = 0;
var errors = [];
samples.forEach((garageId) => {
  ticketsCount += db.datas.count({ garageId, 'leadTicket.createdAt': { $gt: new Date(0) } });
  db.datas
    .distinct('automation.customerId', { garageId, 'leadTicket.createdAt': { $gt: new Date(0) } })
    .forEach((customerId) => {
      var customer = db.customers.findOne({ $or: [{ _id: customerId }, { fusedCustomerIds: customerId }] });
      if (!customer) {
        var data = db.datas.findOne(
          { garageId, 'automation.customerId': customerId, 'leadTicket.createdAt': { $gt: new Date(0) } },
          { _id: 1 }
        );
        errors.push({ garageId, customerId, dataId: data._id });
      }
    });
});

print({ sampleSize: garage ? 1 : sampleSize });
print(errors);
print(errors.length + '/' + ticketsCount);
if (errors.length) {
  print('Il y a un truc qui va pas !!');
} else {
  print('On est bon');
}
