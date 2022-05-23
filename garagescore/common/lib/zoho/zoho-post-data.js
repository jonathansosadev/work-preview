const zoho = require('./zoho-api');

const postGarages = async (garageUpdates) => {
    await zoho.post('Accounts', garageUpdates); // JUST FOR THE PROD
}

const postUsers = async (missingUsers, usersAndLinksUpdates) => {
    zoho.addlogs(`Création de ${Array.isArray(missingUsers) ? missingUsers.length : 0} nouveaux users sur zoho:`);
    await zoho.post('Contacts', missingUsers, true, true);
    await zoho.post('Contacts', usersAndLinksUpdates.users);
    await zoho.post('Contacts_X_Garages', usersAndLinksUpdates.links, true);
}

const postDeals = async (dealsUpdates) => {
    await zoho.post('Deals', dealsUpdates);
}

module.exports = {
    postGarages,
    postUsers,
    postDeals
}






