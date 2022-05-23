module.exports = async (log, headers, db, cb) => {
  if (log.message && log.message.includes('[KPI/INC]')) {
    const message = log.message.replace(/\|/g, '').replace(/\[/g, '').replace(/]/g, '|').split('|');
    const token = `${message[1].replace('Id: ', '').trim()}_${message[2].replace('Timestamp: ', '').trim()}`;
    const dataId = message[5].replace('DataId: ', '').trim();
    const garageId = message[6].replace('GarageId: ', '').trim();
    const ticketType = message[3].replace('TicketType: ', '').trim();
    const origin = message[4].replace('Origin: ', '').trim();
    const date = new Date(parseInt(message[2].replace('Timestamp: ', '').trim(), 10));
    const where = { token, dataId, garageId };
    const kpiEvent = await db.collection('kpiEvents').findOne(where);

    if (!kpiEvent) {
      await db.collection('kpiEvents').insert({
        token,
        dataId,
        garageId,
        ticketType,
        origin,
        date,
        events: [message[7].trim()],
      });
    } else {
      await db.collection('kpiEvents').update(where, {
        $set: { events: [...kpiEvent.events, ...[message[7].trim()]] },
      });
    }
  } else if (log.message && log.message.includes('[KPI/RESET]')) {
    try {
      await db.collection('kpiEvents').drop();
    } catch (e) {
      if (e.code !== 26) {
        console.error(e);
      }
    }
  }
  cb();
};
