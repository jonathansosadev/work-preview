const app = require('../../../server/server');

app.on('booted', async () => {
  try {
    let processed = 0;
    const firstDayOfTheMonth = new Date();
    firstDayOfTheMonth.setDate(1);
    firstDayOfTheMonth.setHours(0, 0, 0, 0);
    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    if (month === 0) {
      year--;
      month = 11;
    } else {
      month--;
    }
    const lastDayOfMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();

    const garages = await app.models.Garage.find({
      where: { 'subscriptions.dateStart': { gte: firstDayOfTheMonth } },
      fields: { subscriptions: true, id: true },
    });
    console.log(`${garages.length} garages to process...`);
    const interval = setInterval(
      () => console.log(`${Math.round((processed / garages.length) * 100)}% Done`),
      5 * 1000
    );
    for (const garage of garages) {
      let oldDate = new Date(garage.subscriptions.dateStart);
      let newDate = new Date(oldDate);
      newDate.setFullYear(year);
      newDate.setMonth(month);
      // update dateStart
      if (newDate.getMonth() !== month) {
        newDate.setMonth(month);
        newDate.setDate(lastDayOfMonth);
      }
      // update billDate if setup is enabled
      if (
        garage.subscriptions.setup &&
        garage.subscriptions.setup.enabled &&
        !garage.subscriptions.setup.alreadyBilled
      ) {
        let billDate = new Date(garage.subscriptions.setup.billDate);
        if (billDate.getMonth() === 0) {
          billDate.setMonth(11);
          billDate.setYear(billDate.getFullYear() - 1);
        } else {
          billDate.setMonth(billDate.getMonth() - 1);
        }
        await app.models.Garage.findByIdAndUpdateAttributes(garage.getId(), {
          'subscriptions.setup.billDate': billDate,
        });
      }
      console.log(`${garage.getId().toString()}, from ${oldDate} to ${newDate}`);
      await app.models.Garage.findByIdAndUpdateAttributes(garage.getId(), { 'subscriptions.dateStart': newDate });
      processed++;
    }
    clearInterval(interval);
    console.log('100% Done');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
