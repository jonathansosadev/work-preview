const server = require('./server/server.js');
const fs = require('fs');
const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const modelFileNameExt = 'json';
const dataFileNameExt = 'js';
const config = require('config');

const readConfigurationDirectory = async (configurationPath, extension, callback) => {
    const configurationDirectory = await fs.promises.opendir(configurationPath);
    for await (const configurationFile of configurationDirectory) {
        const fileNameChunks = configurationFile.name.split('.');
        if (fileNameChunks[fileNameChunks.length - 1] === extension){
            try {
                await callback(`${configurationPath}/${configurationFile.name}`);
            } catch (err) {
                console.error(err);
            };
        }
    }
}

const updateCollectionIfExist = async (collectionNames, collectionName, model) => {
    if (!collectionNames.includes(collectionName) || !server.models[model]) return;

    try {
        await server.models[model].dataSource.autoupdate(model);
    } catch (err) {
        if (!err.toString().includes('Index with name:')) console.error(err);
    };
  }

const createCollectionIfNotExist = async (db, collectionNames, collectionName) => {
    if (collectionNames.includes(collectionName)) return;

    collectionNames.push(collectionName);
    await db.createCollection(collectionName);
}

// Need to do it manually
const createUserCollection = async (db, collectionNames) => {
    await createCollectionIfNotExist(db, collectionNames, 'User');
    await updateCollectionIfExist(collectionNames, 'User', 'User');
}

const setupDatabase = async (db, configurationPath, collectionNames) => {
    await readConfigurationDirectory(configurationPath, modelFileNameExt, async (configurationFilePath) => {
        const file = await fs.promises.readFile(configurationFilePath); 
        const content = JSON.parse(file.toString('utf-8'));
        if (_.get(content, 'mongodb.collection')) {
            await createCollectionIfNotExist(db, collectionNames, content.mongodb.collection);
            if (content.name) await updateCollectionIfExist(collectionNames, content.mongodb.collection, content.name);
        }
    });
    await createUserCollection(db, collectionNames);
}

const getCollectionNameFromFolderName = (folderName) => {
    const folderNameChunks = folderName.split('-');
    return `${folderNameChunks[0]}${folderNameChunks.slice(1).map(chunk => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1)}`).join('')}`;
}

const setupData = async (db, configurationPath, collectionNames) => {
    const configurationDirectory = await fs.promises.opendir(configurationPath);
    for await (const configurationFolder of configurationDirectory) {
        const documents = [];
        const collectionName = getCollectionNameFromFolderName(configurationFolder.name);
        if (!collectionNames.includes(collectionName)) {
            await createCollectionIfNotExist(db, collectionNames, collectionName);
        }

        await readConfigurationDirectory(`${configurationPath}/${configurationFolder.name}`, dataFileNameExt, (configurationFilePath) => {
            documents.push(require(configurationFilePath));
        });

        if (documents.length === 0) continue;
        
        try {
            await db.collection(collectionName).insertMany(documents, { ordered: false });
        } catch (err) {
            // Do not throw documents with existing IDs
            // Useful for avoiding a find request on each document before inserting
            if (!err.toString().includes('duplicate key error collection')) console.log(err); 
        };
    }
}

const run = async () => {
    process.removeAllListeners('warning');
    const client = await MongoClient.connect(config.get('mongo.uri'))
    .catch(err => { console.error(err); });

    if (!client) {
        console.error('Mongo URI connection failed');
        return;
    }

    try {
        const db = client.db(config.get('mongo.db_name'));

        if (!db) {
            console.error('Garagescore database connection failed');
            return;
        }

        const collectionNames = (await db.listCollections().toArray()).map(collection => collection.name);

        await setupDatabase(db, './common/models', collectionNames).catch(console.error);
        await setupData(db, './bootstrap-data', collectionNames).catch(console.error);
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
        process.exit();
    };
};
run();
