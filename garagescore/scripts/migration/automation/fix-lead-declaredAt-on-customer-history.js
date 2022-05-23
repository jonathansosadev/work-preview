const app = require('../../../server/server');

const intro = '[Automation - fix leads on customer histories] :';

const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');
const SourceTypes = require('../../../common/models/data/type/source-types');
const { FED, log } = require('../../../common/lib/util/log');

async function exec() {
  const customerConnector = app.models.Customer.getMongoConnector();
  const dataConnector = app.models.Data.getMongoConnector();
  let found = 0;
  const where = { leads: { $ne: [] } };
  const fields = {
    projection: {
      _id: true,
      leads: true,
    },
  };
  const fieldsData = {
    projection: {
      _id: true,
      'lead.reportedAt': true,
      'leadTicket.createdAt': true,
      'source.type': true,
      'leadTicket.saleType': true,
      'vehicle.plate.value': true,
    },
  };

  const maxCustomers = await customerConnector.countDocuments(where);
  let processed = 0;
  let bulk = [];

  log.info(FED, `${maxCustomers} to process.`);

  const interval = setInterval(
    () =>
      log.info(
        FED,
        `${Math.round((processed / maxCustomers) * 100)}% Done : ${
          maxCustomers - processed
        } customers remaining. ${found} leads added to ${processed}.`
      ),
    5 * 1000
  ); // eslint-disable-line max-len

  const limit = 100;
  let customers = await customerConnector.find(where, fields).sort({ _id: 1 }).limit(limit).toArray();
  while (customers.length) {
    const dataIds = [
      ...new Set([
        ...[].concat.apply(
          [],
          customers.map((c) => c.leads.map((l) => l.dataId))
        ),
      ]),
    ];
    const datas = await dataConnector.find({ _id: { $in: dataIds } }, fieldsData).toArray();
    for (const customer of customers) {
      const customerLeadsId = customer.leads.map((l) => l.dataId);
      customer.leads = [];
      for (const leadId of customerLeadsId) {
        const data = datas.find((d) => d._id.toString() === leadId.toString());
        if (!data) {
          log.error(FED, `Data with dataId ${leadId.toString()} not found. Weird.`);
        } else {
          const ticket = data.leadTicket;
          customer.leads.push({
            leadType: (ticket && ticket.saleType) || LeadSaleTypes.NEW_VEHICLE_SALE,
            declaredAt: (data.lead && data.lead.reportedAt) || ticket.createdAt || null,
            source: (data.source && data.source.type) || SourceTypes.DATAFILE,
            dataId: leadId,
            plate: data.vehicle && data.vehicle.plate && data.vehicle.plate.value,
          });
          customer.leads.sort((a, b) => new Date(a.declaredAt).getTime() - new Date(b.declaredAt).getTime());
          found++;
        }
      }
      bulk.push({
        updateOne: {
          filter: { _id: customer._id },
          update: {
            $set: {
              leads: customer.leads,
            },
          },
        },
      });
      if (bulk.length >= 100) {
        await customerConnector.bulkWrite(bulk);
        bulk = [];
      }
      processed++;
    }
    where._id = { $gt: customers[customers.length - 1]._id };
    customers = await customerConnector.find(where, fields).sort({ _id: 1 }).limit(limit).toArray();
  }
  if (bulk.length) {
    await customerConnector.bulkWrite(bulk);
    bulk = [];
  }
  clearInterval(interval);
  console.log(`${intro} ${found} leads updated on ${processed} customers.`);
  console.log('\ndone');
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
