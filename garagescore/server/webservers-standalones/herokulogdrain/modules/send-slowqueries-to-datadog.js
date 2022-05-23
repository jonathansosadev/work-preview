/* Send Slow graphql query code=H12 desc="Request timeout" to datadog */
// require('dotenv').config({ silent: true });
const datadog = require('./_datadog');
const querystring = require('querystring');
const gql = require('graphql-tag');

const parseLog = (line) => {
  const m = line.match(/low graphql query: (\d+)ms - (.+) - (http[^ ]+)/);
  if (m && m.length === 4) {
    if (line.indexOf('mutation') > 0) {
      return null;
    }
    const timeOrg = parseInt(m[1], 10);
    const id = m[2];
    const req = m[3];
    const url = querystring.parse(req.replace(`${process.env.APP_URL}/graphql?`, ''));
    const graphqlQuery = url.query;
    const gData = gql`
      ${graphqlQuery}
    `;
    const queryName = gData.definitions[0].selectionSet.selections[0].name.value;
    const queryArgs =
      (
        gData.definitions[0].selectionSet.selections[0].arguments &&
        gData.definitions[0].selectionSet.selections[0].arguments.map((a) => `${a.name.value}=${a.value.value}`)
      ).sort() || '';

    return { id, timeOrg, graphqlQuery, queryName, queryArgs: queryArgs.join(' '), queryHttp: req };
  }
  return null;
};
module.exports = (log, headers, db, cb) => {
  if (log.message && log.message.indexOf('Slow graphql query') >= 0) {
    const graphql = parseLog(log.message.replace(/\t/g, ' '));
    if (!graphql) {
      cb();
      return;
    }
    const date = Math.round(new Date(log.emitted_at || 0).getTime() / 1000);
    const time = parseInt(graphql.timeOrg || 0, 10);
    const props = {
      host: log.appname || 'unknown',
      tags: [`queryArgs:${graphql.queryArgs.replace(/ /g, '_')}`, `queryName:${graphql.queryName}`, `time:${time}`],
      date_happened: date,
    };
    const title = 'Slow graphql query';
    const text = `${log.emitted_at} ${JSON.stringify(props)}`;
    console.log(title, text);
    datadog.async.create(title, text, props, (err) => {
      if (err) {
        console.error(err);
        cb();
        return;
      }
      datadog.async.send('log.event.slowquery', 1, props, (err2) => {
        if (err2) {
          console.error(err2);
          cb();
          return;
        }
        datadog.async.send('log.event.slowquery-timespent', time, props, (err3) => {
          if (err3) {
            console.error(err3);
          }
          cb();
        });
      });
    });
  } else {
    cb();
  }
};
// eslint-disable-next-line
// const line = '2260 <190>1 2019-08-23T21:30:33.552655+00:00 app web.1 - - Slow graphql query: 85077ms - d4cb0698-2d37-488c-9643-812ce3002089 - https://app.custeed.com/graphql?query=%7B%0A%20%20%20%20%20%20%20%20%20%20leadsList(limit%3A%2010%2C%20skip%3A%200%2C%20periodId%3A%20%22lastQuarter%22%2C%20garageId%3A%20%225ae7352949732400131050ed%22%2C%20cockpitType%3A%20%22Dealership%22)%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20id%0Atype%0AisAgent%0AleadVehicle%0AleadSaleType%0AleadTicketCreatedAt%0AfollowupLeadStatus%0AleadBodyType%0AleadEnergyType%0AleadCylinder%0AleadType%0AleadFinancing%0AleadTradeIn%0AleadTiming%0Amanager%20%7B%0A%20%20%20%20%20%20%20%20%20%20firstName%0AlastName%0Aemail%0A%0A%20%20%20%20%20%20%20%20%7DcustomerFullName%0AcustomerContactMobilePhone%0AcustomerContactEmail%0AcustomerCity%0AvehiclePlate%0AleadTicketBrandModel%0AleadTicketBudget%0AreviewComment%0AticketStatus%0AticketActions%20%7B%0A%20%20%20%20%20%20%20%20%20%20name%0AcreatedAt%0Acomment%0Aassigner%20%7B%0A%20%20%20%20%20%20%20%20%20%20lastName%0AfirstName%0Aemail%0A%0A%20%20%20%20%20%20%20%20%7DticketManager%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0AlastName%0AfirstName%0Aemail%0A%0A%20%20%20%20%20%20%20%20%7DpreviousTicketManager%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0AlastName%0AfirstName%0Aemail%0A%0A%20%20%20%20%20%20%20%20%7DmissedSaleReason%0AwasTransformedToSale%0AcrossLeadConverted%0AnewValue%0ApreviousValue%0AnewArrayValue%0ApreviousArrayValue%0Afield%0AreminderDate%0AreminderActionName%0AreminderStatus%0AreminderTriggeredBy%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0AfirstName%0AlastName%0A%0A%20%20%20%20%20%20%20%20%7DfollowupLeadRecontacted%0AfollowupLeadSatisfied%0AfollowupLeadSatisfiedReasons%0AfollowupLeadNotSatisfiedReasons%0AfollowupLeadAppointment%0AisManual%0A%0A%20%20%20%20%20%20%20%20%7DreviewRatingValue%0AreportedAt%0AgarageId%0AgaragePublicDisplayName%0AgarageType%0AfollowupLeadSendDate%0AfollowupLeadResponseDate%0AfollowupLeadRecontacted%0AfollowupLeadSatisfied%0AfollowupLeadSatisfiedReasons%0AfollowupLeadNotSatisfiedReasons%0AfollowupLeadAppointment%0A%0A%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D	L0G_debug	2019-8-23 11:18:33	Unknown path	extensions	JS	1566551913552';
// const logs = require('../heroku-log-parser.js')(line);
// module.exports(logs[0], {}, () => { process.exit(); });
