/*
Créé une table temporaire pour suivre l'état de la migration 
*/
db.tmpFixCustomers.deleteMany({});
var docs = db.garages
  .find({ 'subscriptions.Automation.enabled': true }, { _id: 1 })
  .map((g) => ({ _id: g._id, status: 'WAITING' }));
db.tmpFixCustomers.insertMany(docs);
