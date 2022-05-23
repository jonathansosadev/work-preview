const app = require('../../../server/server.js');

app.on('booted', () => {
  app.models.Data.dataSource.autoupdate('Data', (err) => {
    if (err) {
      console.error(err);
    }
    const collection = app.models.Data.getMongoConnector();
    collection.createIndex(
      {
        'customer.fullName.value': 'text',
        'customer.city.value': 'text',
        'customer.contact.email.value': 'text',
        'customer.contact.mobilePhone.value': 'text',
        garageId: 1,
        'service.providedAt': -1,
      },
      {
        weights: {
          'customer.contact.email.value': 100,
          'customer.contact.mobilePhone.value': 100,
          'customer.fullName.value': 20,
          'customer.city.value': 10,
        },
        default_language: 'none',
        name: 'cockpit_search',
      },
      (err0) => {
        if (err0) {
          console.error(err);
        }
        console.log('update done');
        process.exit();
      }
    );
  });
});
