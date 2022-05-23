const app = require('../../../server/server.js');
const zoho = require('./zoho-api');
const { getUpdate, formatZohoDate } = require('./utils');

const { isGarageScoreUser } = require('../../models/user/user-methods');

const transformUser = {
  /** dont forget to add the fields in the find projection */ Email: 'email',
  Last_Name: (u) => (u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : ''),
  lastCockpitOpenAt: (u) =>
    u && u.lastCockpitOpenAt && u.lastCockpitOpenAt instanceof Date
      ? u.lastCockpitOpenAt.toISOString().slice(0, 10)
      : '',
  // Here I can't use process.env.APP_URL because those info will be stored in Zoho, so it will remain hardcoded
  cockpitURL: (u) => `https://app.custeed.com/cockpit/admin/user?id=${u.id.toString()}`,
  userId: (u) => u.id.toString(),
  job: 'job',
  Service: (u) => [u.job || 'Autre'],
  Mobile: 'mobilePhone',
  Phone: 'phone',
  Statut_du_contact: () => 'Client',
};

const handleUserModifications = async (usersToModify, zohoGarages) => {
  const updates = { users: [], links: [] };
  const zohoGarageByIds = zohoGarages.reduce((acc, g) => {
    acc[g.GS_GarageID] = g;
    return acc;
  });
  const usersFromMongo = await app.models.User.find({
    where: { email: { inq: usersToModify.map((u) => u.Email.toLowerCase()) } },
    fields: {
      id: 1,
      email: 1,
      firstName: 1,
      lastName: 1,
      lastCockpitOpenAt: 1,
      job: 1,
      mobilePhone: 1,
      phone: 1,
      garageIds: 1,
    },
  });

  for (const userZoho of usersToModify) {
    // eslint-disable-line no-restricted-syntax
    const userMongo = usersFromMongo.find((u) => u.email === userZoho.Email);
    if (userMongo) {
      const userGarageIds = userMongo.garageIds.map((id) => id.toString()).filter((g) => zohoGarageByIds[g]);
      updates.links.push(
        ...userGarageIds.map((garageMongoId) => ({
          Utilisateurs: { id: userZoho.id },
          Recherche_s_lection_multiple_1: { id: zohoGarageByIds[garageMongoId].id },
        }))
      );
      const zohoFields = Object.keys(userZoho);
      let updateFields = await Promise.all(zohoFields.map(async (field) => {
        // eslint-disable-line no-loop-func
        try {
          const update = await getUpdate(transformUser, field, userZoho, userMongo);
          if (!update) return null;
          return update;
        } catch (e) {
          console.error(
            `handleUserModifications error for user : ${userMongo.id.toString()} : ${e} more details here:`
          );
          console.error(e);
          return null;
        }
      }));
      updateFields = updateFields.filter((obj) => obj);
      if (updateFields.length > 0) {
        updates.users.push({
          id: userZoho.id,
          last_api_update: formatZohoDate(new Date()),
          ...updateFields.reduce((acc, update) => {
            acc[update.field] = update.newValue;
            return acc;
          }, {}),
        });
      }
    }
  }
  return updates;
};

const handleNewUserAddition = async (zohoUsers) => {
  let missingUsers = await app.models.User.find({
    where: { email: { nin: zohoUsers.map((u) => u.Email.toLowerCase()) } },
    fields: {
      id: 1,
      email: 1,
      firstName: 1,
      lastName: 1,
      lastCockpitOpenAt: 1,
      job: 1,
      mobilePhone: 1,
      phone: 1,
    },
  });
  zoho.addlogs(missingUsers.length, 'missing users before removing garagescore users');
  missingUsers = missingUsers.filter((u) => !isGarageScoreUser(u));
  zoho.addlogs(missingUsers.length, 'missing users after removing garagescore users');
  if (missingUsers.length <= 0) return [];
  return missingUsers.map((u) => ({
    Email: u.email.toLowerCase(),
    Last_Name: u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : 'Unknown',
    lastCockpitOpenAt:
      u && u.lastCockpitOpenAt && u.lastCockpitOpenAt instanceof Date
        ? u.lastCockpitOpenAt.toISOString().slice(0, 10)
        : '',
    // Here I can't use process.env.APP_URL because those info will be stored in Zoho, so it will remain hardcoded
    cockpitURL: `https://app.custeed.com/cockpit/admin/user?id=${u.id.toString()}`,
    userId: u.id.toString(),
    job: u.job || '',
    Service: [u.job || 'Autre'],
    Mobile: u.mobilePhone || '',
    Phone: u.phone || '',
    Marques_du_portefeuille_css: ['Autre'],
    Statut_du_contact: 'Client',
  }));
};

module.exports = {
  handleUserModifications,
  handleNewUserAddition,
};
