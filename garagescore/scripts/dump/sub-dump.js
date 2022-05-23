/* global dateMin:true, dateMax:true, ISODate, ObjectId, printjsononeline, db */
/* eslint-disable new-cap */

/*
We could just dump with a filter on the creation date but this file is here so we can make more complicated stuff in the future
(eg, dump the contacts sent after the maxdate but from a data before the max date)
*/

dateMin = dateMin.split('/').reverse().join('-') + ' 00:00:00.000Z';
dateMax = dateMax.split('/').reverse().join('-') + ' 23:59:59.999Z';
var min;
var max;
var filter;

/* Datafiles */
min = db.dataFiles
  .find({ createdAt: { $gte: ISODate(dateMin) } })
  .sort({ createdAt: 1 })
  .limit(1);
max = db.dataFiles
  .find({ createdAt: { $lt: ISODate(dateMax) } })
  .sort({ createdAt: -1 })
  .limit(1);
filter = { _id: { $gte: min[0]._id, $lt: max[0]._id } };
printjsononeline(filter);
/* campaigns */
min = db.campaigns
  .find({ createdAt: { $gte: ISODate(dateMin) } })
  .sort({ createdAt: 1 })
  .limit(1);
max = db.campaigns
  .find({ createdAt: { $lt: ISODate(dateMax) } })
  .sort({ createdAt: -1 })
  .limit(1);
filter = { _id: { $gte: min[0]._id, $lt: max[0]._id } };
printjsononeline(filter);
/* datas
ObjectIds have created during a migration in January 2018 we cannot use them
*/
filter = { createdAt: { $gte: ISODate(dateMin), $lt: ISODate(dateMax) } };
printjsononeline(filter);
/* contacts */
min = db.contacts
  .find({ createdAt: { $gte: ISODate(dateMin) } })
  .sort({ createdAt: 1 })
  .limit(1);
max = db.contacts
  .find({ createdAt: { $lt: ISODate(dateMax) } })
  .sort({ createdAt: -1 })
  .limit(1);
filter = { _id: { $gte: min[0]._id, $lt: max[0]._id } };
printjsononeline(filter);
/* short urls */
min = db.shortUrls
  .find({ createdAt: { $gte: ISODate(dateMin) } })
  .sort({ createdAt: 1 })
  .limit(1);
max = db.shortUrls
  .find({ createdAt: { $lt: ISODate(dateMax) } })
  .sort({ createdAt: -1 })
  .limit(1);
filter = { _id: { $gte: min[0]._id, $lt: max[0]._id } };
printjsononeline(filter);
