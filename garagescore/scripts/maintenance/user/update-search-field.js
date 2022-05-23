const app = require('../../../server/server.js');
const { promisify } = require('util');

async function exec() {
  console.log(`${new Date()} start of generating search field`);
  let count = 0;
  const users = await promisify((cb) => app.models.User.find({}, cb))();
  setInterval(() => console.log(`executed: ${count} from ${users.length}`), 10000);
  for (let i = 0; i < users.length; i++) {
    await promisify((cb) => users[i].save(cb))();
    count++;
  }
  console.log(`${new Date()} end of generating search field`);
}
app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
