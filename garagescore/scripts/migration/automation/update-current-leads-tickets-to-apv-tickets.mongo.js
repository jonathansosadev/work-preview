// db.getCollection('datas').createIndex({ garageId: 1, 'source.type': 1, 'leadTicket.createdAt': 1 });
// db.datas.dropIndex("garageId_1_source.type_1_leadTicket.createdAt_1");

// MIGRATION DE:
// Echéance par défaut = 30j pour les leads Apv
// Delete actions "proposition"
// Modification motifs de fermeture de tous les leads par "autre"

let updated = 0;
let alreadyUpdated = 0;
db.getCollection('datas')
  .aggregate([
    {
      $match: {
        garageId: {
          $in: db
            .getCollection('garages')
            .find({ 'subscriptions.Automation.enabled': true })
            .toArray()
            .map((g) => '' + g._id),
        },
        'source.type': 'Automation',
        'lead.saleType': 'Maintenance',
      },
    },
    {
      $project: {
        leadTicket: true,
      },
    },
  ])
  .forEach((data) => {
    let shouldUpdate = false;
    const update = {};
    const leadTicket = data.leadTicket || {};
    if (leadTicket.actions) {
      if (leadTicket.actions.find((a) => a.name === 'proposition')) {
        shouldUpdate = true;
        update.$pull = { 'leadTicket.actions': { name: 'proposition' } };
      } else if (leadTicket.actions.find((a) => a.name === 'reminder' && a.reminderActionName === 'proposition')) {
        shouldUpdate = true;
        update.$pull = { 'leadTicket.actions': { name: 'reminder', reminderActionName: 'proposition' } };
      }
    }
    if (leadTicket.saleType !== 'Maintenance') {
      shouldUpdate = true;
      if (!update.$set) update.$set = {};
      update.$set['leadTicket.saleType'] = 'Maintenance';
    }
    if (leadTicket.timing !== 'Now') {
      shouldUpdate = true;
      if (!update.$set) update.$set = {};
      update.$set['leadTicket.timing'] = 'Now';
    }
    if (leadTicket.missedSaleReason && leadTicket.missedSaleReason[0] !== 'APV_Others') {
      shouldUpdate = true;
      if (!update.$set) update.$set = {};
      update.$set['leadTicket.missedSaleReason'] = ['APV_Others'];
    }
    if (leadTicket.status === 'WaitingForProposition' || leadTicket.status === 'PropositionPlanned') {
      shouldUpdate = true;
      if (!update.$set) update.$set = {};
      update.$set['leadTicket.status'] = 'WaitingForClosing';
    }
    if (shouldUpdate) {
      db.getCollection('datas').updateOne({ _id: data._id }, update);
      updated++;
    } else alreadyUpdated++;
  });
print('Updated ' + updated + ' successfully !');
print('Already updated ' + alreadyUpdated + ' successfully !');
