const config = require('config');
const URI = require('urijs');

const { TEST_DB_NAME } = require('../common/lib/test/constants');
/*
const fs = require('fs');
const sslCA = [fs.readFileSync(`${__dirname}/../certs/ca.crt`, 'utf8')];
const sslCert = fs.readFileSync(`${__dirname}/../certs/server.crt`, 'utf8');
const sslKey = fs.readFileSync(`${__dirname}/../certs/server.pem`, 'utf8');
*/

function _generateMemoryUri() {
  const uri = process.env.MEMORY_DB_URI ? new URI(process.env.MEMORY_DB_URI) : null;

  if (uri) {
    return uri.addSearch({ connectTimeoutMS: 99999999, authMode: 'scram-sha1' }).toString().replace('::', ',');
  }
  console.error('No MongoDB In Memory URI In Test Context!');
  return process.exit(1);
}

console.log('Running datasources.local');

const useMemoryDb =
  typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ||
  process.env.USE_MEMORY_DB === 'true' ||
  process.env.USE_MEMORY_DB === true;
const memoryURI = useMemoryDb ? _generateMemoryUri() : null;
const url = useMemoryDb ? memoryURI : config.get('mongo.uri');

module.exports = {
  // Add properties to the datasources defined in datasources.json
  garagescoreMongoDataSource: {
    url,
    connector: 'mongodb',
    protocol: 'mongodb+srv',
    database: useMemoryDb ? TEST_DB_NAME : process.env.DB_NAME || 'heroku_6jk0qvwj',
  },
};

/*
#!/bin/sh

# Generate self signed root CA cert
openssl req -nodes -x509 -newkey rsa:2048 -keyout ca.key -out ca.crt -subj "/C=FR/ST=FR/L=Cachan/O=MongoDB/OU=root/CN=`hostname -f`/emailAddress=kevinadi@mongodb.com"


# Generate server cert to be signed
openssl req -nodes -newkey rsa:2048 -keyout server.key -out server.csr -subj "/C=FR/ST=FR/L=Cachan/O=MongoDB/OU=server/CN=`hostname -f`/emailAddress=kevinadi@mongodb.com"

# Sign the server cert
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt

# Create server PEM file
cat server.key server.crt > server.pem


# Generate client cert to be signed
openssl req -nodes -newkey rsa:2048 -keyout client.key -out client.csr -subj "/C=FR/ST=FR/L=Cachan/O=MongoDB/OU=client/CN=`hostname -f`/emailAddress=kevinadi@mongodb.com"

# Sign the client cert
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAserial ca.srl -out client.crt

# Create client PEM file
cat client.key client.crt > client.pem


# Create clientPFX file (for Java, C#, etc)
# openssl pkcs12 -inkey client.key -in client.crt -export -out client.pfx


# Start mongod with SSL
# mkdir -p data/db
# mongod --sslMode requireSSL --sslPEMKeyFile server.pem --sslCAFile ca.crt --dbpath data/db --logpath data/mongod.log --fork

# Connect to mongod with SSL
# mongo --ssl --sslCAFile ca.crt --sslPEMKeyFile client.pem --host `hostname -f`
*/
