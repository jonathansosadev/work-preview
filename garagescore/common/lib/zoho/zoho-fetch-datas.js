const { ObjectId } = require('mongodb');
const zoho = require('./zoho-api');

const {
    crossLeadsLast7DaysSourcesDisabled,
} = require('./garages');

const fetchGaragesInfos = async () => {
    await crossLeadsLast7DaysSourcesDisabled();
    const allZohoGarages = await zoho.get('Accounts');
    const zohoGarages = allZohoGarages.filter((g) => g.GS_GarageID && ObjectId.isValid(g.GS_GarageID));
    zoho.addlogs(`${zohoGarages.length} garages avec un GS_GarageID`);

    return zohoGarages;

}

const fetchUserInfos = async (pageMin, pageMax) => {
    let zohoUsers = await zoho.get('Contacts', pageMin, pageMax);
    zohoUsers = zohoUsers.filter((u) => u.Email);
    zoho.addlogs(`${zohoUsers.length} users with email`);
    return zohoUsers;

}

const fetchDeals = async (pageMin, pageMax) => {
    return zoho.get('Deals', pageMin, pageMax);
}

module.exports = {
    fetchGaragesInfos,
    fetchUserInfos,
    fetchDeals
}
