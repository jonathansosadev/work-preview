/*
  This Script aims to create/update users scopes and create/update collection scopes.
    --userIds : if used , the script will handle only those users	
          example : --userIds="5bd339aa981fc80014a950c3, 5fda1b93654b8b53b8aa2874"
    --excludeGS : if used , the script will ignore garagescore/custeed users even if passed in --userIds
          example : --excludeGS
    --datas : if used , the script will add the userScope to the field scopes in datas
  Good to know :
    _ if the collection 'scopes' doesn't exists , it will be created by the script
    _ the script take ~20sec to process all the users without --datas (local)
    _ the script take ~28sec to process user Adelaide with --datas (local)
    _ the script take ~23mn to process all users with --datas (local)
  
*/

const app = require('../../../server/server');
const { MongoClient, ObjectID } = require('mongodb');
const config = require('config');
const asyncPool = require('./asyncPool');

//--------------------------------------------------------------------------------------//
//                                        Global                                        //
//--------------------------------------------------------------------------------------//

const Global = Object.seal({
  parsedArgs: [],
  usersToProcessCount: 0,
  usersProcessedCount: 0,
  processedDatasCount: 0,
  updatedDatasCount: 0,
  garagesToProcessCount: 0,
  garagesProcessedCount: 0,
  updatedUsersCount: 0,
  createdScopeCount: 0,
  DB: null,
  get scopeConnector() {
    return this.DB.collection('scopes');
  },
  get userConnector() {
    return app.models.User.getMongoConnector();
  },
  get dataConnector() {
    return app.models.Data.getMongoConnector();
  },
  handleArgsError(argName, errorMessage) {
    errorMessage && this.logRed(errorMessage);
    this.logRed(`Invalid usage of argument : ${argName}`);
    this.logRed(
      `Usage : node scripts/migration/scopes/userScope.js --excludeGS --userIds="5bd339aa981fc80014a950c3, 5fda1b93654b8b53b8aa2874" --datas`
    );
    process.exit(1);
  },
  addArg(arg) {
    this.parsedArgs.push(arg);
  },
  getArg(argName) {
    const arg = this.parsedArgs.find((arg) => arg[argName]);
    return arg ? arg[argName] : null;
  },
  logReport() {
    const elements = [
      `Report :`,
      `Processed user : ${this.usersProcessedCount}/${this.usersToProcessCount}`,
      `Updated User's scopes : ${this.updatedUsersCount}`,
      `Created scopes : ${this.createdScopeCount}`,
    ];
    if (this.getArg('--datas'))
      elements.push(...[`Processed datas : ${this.processedDatasCount}`, `Updated datas : ${this.updatedDatasCount}`]);
    this.logGreen(elements.join('\n\t\u2022 '));
  },
  exit(errorCode = 1) {
    if (this.mongoClient) {
      this.mongoClient.close();
    }
    this.logReport();
    process.exit(errorCode);
  },
  logGreen(str) {
    console.log('\x1b[32m', `[ SCOPES ] ${str}`, '\x1b[0m');
  },
  logYellow(str) {
    console.log('\x1b[33m', `[ SCOPES ] ${str}`, '\x1b[0m');
  },
  logRed(str) {
    console.log('\x1b[31m', `[ SCOPES ] ${str}`, '\x1b[0m');
  },
});
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                      Arguments                                       //
//--------------------------------------------------------------------------------------//

function parseArgs() {
  const argsConfig = [
    /* if specified , ignore garagscore/custeed users */
    {
      name: '--excludeGS',
      acceptValue: false,
    },
    {
      name: '--datas',
      acceptValue: false,
    },
    {
      name: '--userIds',
      acceptValue: true,
      validator: (userIds) => userIds.split(',').every((userId) => ObjectID.isValid(userId.trim())),
      parser: (userIds) => userIds.split(',').map((userId) => ObjectID(userId.trim())),
    },
  ];
  const getArg = (arg) => process.argv.slice(2).find((el) => el.includes(arg));

  for (const arg of argsConfig) {
    try {
      if (!getArg(arg.name)) continue;
      const currentArg = {};

      if (arg.acceptValue) {
        const value = getArg(arg.name).split('=')[1].trim();
        /* if arg doesn't pass validator => log error && exit */
        if (!arg.validator(value)) return Global.handleArgsError(arg.name);
        currentArg[arg.name] = arg.parser(value);
      } else {
        currentArg[arg.name] = true;
      }
      /* add parsed arg */
      Global.addArg(currentArg);
      Global.logGreen(`Using argument : ${arg.name}`);
    } catch (error) {
      Global.handleArgsError(arg.name, error.message);
    }
  }
}
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                       getUsers                                       //
//--------------------------------------------------------------------------------------//

async function getUsers() {
  try {
    const usersQuery = {};
    /* use usersIds given in script arguments */
    const usersIdsArg = Global.getArg('--userIds');
    if (usersIdsArg) {
      usersQuery['_id'] =
        usersIdsArg.length > 1 ? { $in: usersIdsArg.map((id) => ObjectID(id)) } : ObjectID(usersIdsArg[0]);
    }

    /* exclude gs users if specified with --excludeGS */
    const excludeGS = Global.getArg('--excludeGS');
    if (excludeGS) {
      usersQuery['email'] = { $not: /@garagescore|@custeed/ };
    }

    /* get users */
    const users = await Global.userConnector.find(usersQuery).project({ garageIds: 1, scope: 1 }).toArray();
    Global.usersToProcessCount = users.length;

    return users;
  } catch (error) {
    throw Error(`getUsers : ${error}`);
  }
}
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                    Process users                                     //
//--------------------------------------------------------------------------------------//
async function processUsers(users) {
  /* return the expected scope of a user */
  const getExpectedUserScopeId = async (garageIds) => {
    const garageIdsSize = garageIds.length;
    /* i don't trust nodejs to always sort properly an ObjectID*/
    const gIds = garageIds
      .map((id) => id.toString())
      .sort((a, b) => a.localeCompare(b))
      .map((id) => ObjectID(id));

    /* find a scope with the same garageIds */
    const res = await Global.scopeConnector.findOne({
      garageIds: { $size: garageIdsSize, $eq: gIds },
    });

    /* if a scope with the same garageIds already exists, assign it to the user */
    if (res) return ObjectID(res._id);
    /* otherwise we create a new scope in order to assign it to the user */
    const { insertedId } = await Global.scopeConnector.insertOne({ garageIds: gIds });
    /* for logs */
    Global.createdScopeCount++;

    return ObjectID(insertedId);
  };

  /* to process garages datas later */
  const garageIdsToProcess = {};
  const buildGaragesToProcess = (garageIds, userScope) => {
    const garageIdsToString = garageIds.map((id) => id.toString());
    const scope = userScope.toString();

    garageIdsToString.forEach((gId) => {
      if (!garageIdsToProcess[gId]) {
        garageIdsToProcess[gId] = [];
      }
      if (!garageIdsToProcess[gId].includes(scope)) garageIdsToProcess[gId].push(scope);
    });
  };

  /* loop over users and assign them a scope or create one if needed */
  for (const { _id, garageIds, scope = null } of users) {
    /* get the expected scope of a user */
    const expectedUserScopeId = await getExpectedUserScopeId(garageIds);

    /* assign the scope to the user if he doesn't have one or if it's not the one expected */
    if (!scope || !ObjectID.isValid(scope.toString()) || !scope.equals(expectedUserScopeId)) {
      const update = await Global.userConnector.updateOne(
        { _id: ObjectID(_id) },
        { $set: { scope: expectedUserScopeId } }
      );

      /* for logs */
      Global.updatedUsersCount += update.result.nModified || 0;
    }

    /* for logs */
    Global.usersProcessedCount++;

    /* to process garages datas later */
    if (Global.getArg('--datas')) buildGaragesToProcess(garageIds, expectedUserScopeId);
  }

  return garageIdsToProcess;
}

//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                    Process users datas                               //
//--------------------------------------------------------------------------------------//

/* we receive an object : { "garageId1" : [userScope1, userScope2 ...], ...} */
/* we convert it to an array of garageIds and send it to the pool to be processed */
async function processUserDatas(garageIdsToProcess) {
  await asyncPool(10, Object.keys(garageIdsToProcess), async (garageId) => {
    const usersScopes = garageIdsToProcess[garageId.toString()];
    if (usersScopes.length) {
      const usersScopeOid = usersScopes.map((scope) => ObjectID(scope));
      const res = await Global.dataConnector.updateMany(
        { garageId: garageId.toString() },
        { $addToSet: { scopes: { $each: usersScopeOid } } }
      );
      /* for logs */
      if (res && res.result) {
        Global.processedDatasCount += res.result.n || 0;
        Global.updatedDatasCount += res.result.nModified || 0;
        Global.garagesProcessedCount++;
        process.stdout.write(
          `\x1b[0G\x1b[33m [ SCOPES ] Garages processed : ${Global.garagesProcessedCount} / ${Global.garagesToProcessCount} \x1b[0m`
        );
      }
    }
  });
  console.log('\n');
}
//--------------------------------------------------------------------------------------//

//--------------------------------------------------------------------------------------//
//                                        Start                                         //
//--------------------------------------------------------------------------------------//

app.on('booted', async () => {
  try {
    console.time('SCRIPT');
    /* Graceful shutdown */
    process.on('SIGINT', () => {
      Global.logYellow('[ Stopping script ]');
      Global.exit(0);
    });

    /* parse arguments */
    parseArgs();

    /* connect mongo client */
    const client = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
    Global.DB = client.db();

    /* check if collection scopes exists , otherwise create it */
    const res = await Global.DB.listCollections({ name: 'scopes' }).toArray();
    if (res.length === 0) {
      Global.logYellow("Collection 'scopes' not found");
      Global.logYellow("Creating collection 'scopes'");
      await Global.DB.createCollection('scopes');
      Global.logGreen("Collection 'scopes' successfully created");
    }

    /* get users to process */
    const users = await getUsers();
    Global.logGreen(`Running on ${users.length} users`);

    /* we keep track of users garageIds to update datas later */
    const garageIdsToProcess = await processUsers(users);

    /* process datas */
    Global.garagesToProcessCount = Object.keys(garageIdsToProcess).length;
    if (Global.getArg('--datas') && Global.garagesToProcessCount) {
      await processUserDatas(garageIdsToProcess);
    }
  } catch (error) {
    Global.logRed(`Error : ${error}`);
    Global.exit(1);
  } finally {
    console.timeEnd('SCRIPT');
    Global.exit(0);
  }
});
//--------------------------------------------------------------------------------------//
