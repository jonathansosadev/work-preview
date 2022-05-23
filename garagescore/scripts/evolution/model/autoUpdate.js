/** Syncro db shema with json model definitions*/
if (process.argv.length < 3) {
  console.error('Enter a modelName as the first param (ex: Event)');
  process.exit();
}
var model = process.argv[2];
if (model[0] === '-') {
  console.error('Enter a modelName as the first param (ex: Event)');
  process.exit();
}
console.log('updating ' + model);
require('../../../server/server.js').models[model].dataSource.autoupdate(model, function (err) {
  if (err) {
    console.error(err);
  }
  console.log('update done');
  process.exit();
});
