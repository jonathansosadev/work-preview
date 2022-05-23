module.exports = function DatasAsyncviewLeadTicketDefinition(DatasAsyncviewLeadTicket) {
  const noop = () => {};
  // It's supposed to be a readOnly collection. So let's enforce it (loopback side)
  // Disable create operations
  DatasAsyncviewLeadTicket.create = noop;
  DatasAsyncviewLeadTicket.findOrCreate = DatasAsyncviewLeadTicket.find; // Here we disable only the create part
  // Disable update operations
  DatasAsyncviewLeadTicket.updateAll = noop;
  DatasAsyncviewLeadTicket.bulkUpdate = noop;
  DatasAsyncviewLeadTicket.replaceById = noop;
  DatasAsyncviewLeadTicket.replaceOrCreate = noop;
  DatasAsyncviewLeadTicket.upsert = noop;
  DatasAsyncviewLeadTicket.upsertWithWhere = noop;
  DatasAsyncviewLeadTicket.prototype.save = noop;
  DatasAsyncviewLeadTicket.prototype.updateAttribute = noop;
  DatasAsyncviewLeadTicket.prototype.updateAttributes = noop;
  // Disable delete operations
  DatasAsyncviewLeadTicket.destroyAll = noop;
  DatasAsyncviewLeadTicket.destroyById = noop;
  DatasAsyncviewLeadTicket.prototype.destroy = noop;

  /*
  // It's supposed to be a readOnly collection. So let's enforce it (mongo side)
  // Unfortunately I can't protect the aggregate easily at the moment
  const originalMongoConnector = DatasAsyncviewLeadTicket.getMongoConnector();
  // Here we will just return a light version of the original connector
  DatasAsyncviewLeadTicket.getMongoConnector = () => {
    const forbiddenMethods = [
      'bulkWrite',
      'deleteMany',
      'deleteOne',
      'drop',
      'findAndModify',
      'findAndRemove',
      'findOneAndDelete',
      'findOneAndReplace',
      'findOneAndUpdate',
      'insert',
      'insertMany',
      'insertOne',
      'remove',
      'replaceOne',
      'update',
      'updateMany',
      'updateOne'
    ];
    return Object.fromEntries(
      Object.entries({ ...originalMongoConnector }).filter(([checkedProp]) => !forbiddenMethods.includes(checkedProp))
    );
  };
  */
};
