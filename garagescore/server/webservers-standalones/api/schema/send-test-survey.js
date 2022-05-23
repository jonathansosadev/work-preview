const { ObjectID } = require('mongodb');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const AutomationCampaignChannelTypes = require('../../../../common/models/automation-campaign-channel.type.js');
const { AutomationCampaignsEventsType } = require('../../../../frontend/utils/enumV2');

const timeHelper = require('../../../../common/lib/util/time-helper');
const moment = require('moment');
const { promisify } = require('util');
const _ = require('lodash');
const automationSendContactToCustomer = require('../../../../workers/jobs/scripts/automation-send-contact-to-customer.js');
const gsDataFileDataTypes = require('../../../../common/models/data-file.data-type');
const { getExampleGarageId } = require('../../../../common/lib/util/app-config.js');
const GarageTypes = require('../../../../common/models/garage.type.js');
const { decodePhone } = require('../../../../common/lib/garagescore/cross-leads/util.js');
const { isGarageScoreUserByEmail } = require('../../../../common/lib/garagescore/custeed-users');

const typePrefix = 'sendTestSurvey';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.sendTestSurvey.type}: ${typePrefix}
  }
  type ${typePrefix} {
    message: String
    status: String
  }
`;

const createAddLog = async (app, defaultId, automationCampaign, customer, eventType, email, optionnal) => {
  await app.models.AutomationCampaignsEvents.addLog(
    {
      garageId: new ObjectID(defaultId),
      campaignId: automationCampaign._id,
      customerId: customer._id,
      eventType,
      contactType: email ? AutomationCampaignChannelTypes.EMAIL : AutomationCampaignChannelTypes.MOBILE,
      target: automationCampaign.target,
      campaignType: automationCampaign.type,
      campaignRunDay: timeHelper.todayDayNumber(),
    },
    optionnal
  );
};

module.exports.resolvers = {
  Mutation: {
    sendTestSurvey: async (obj, args, context) => {
      const { app } = context;
      let { email, mobilePhone, dataType, garageType, lang, target, sendGDPR } = args;
      if (!email && !mobilePhone) return Promise.resolve({ status: 'error', message: "Pas d'email/mobilePhone" });
      // We can now send test surveys automation
      if (dataType !== 'AUTOMATION' && !gsDataFileDataTypes.isSupported(dataType))
        return Promise.resolve({ status: 'error', message: "Type d'enquête inconnu" });
      if (!garageType) return Promise.resolve({ status: 'error', message: 'Il manque le type de garage' });
      if (mobilePhone) {
        const langs = {
          fr: 'FR',
          es: 'ES',
          en: 'US',
          ca: 'ES',
          fr_BE: 'BE',
          nl_BE: 'BE'
        }
        const mobileLong = langs[lang]; // the CATALAN mobile does not exist, override to ES
        mobilePhone = decodePhone(mobilePhone, mobileLong); // if exist, format phone number
      }

      const date = moment().format('DD/MM/YYYY');
      const gender = 'Mr';
      const firstName = _.sample([
        'Philippe',
        'Patrick',
        'Jean',
        'Pascal',
        'Michel',
        'Olivier',
        'Benjamin',
        'Alain',
        'Didier',
      ]);
      const lastName = _.sample(['MARTIN', 'BERNARD', 'THOMAS', 'PETIT', 'ROBERT', 'RICHARD', 'DUBOIS', 'MOREAU']);
      const city = 'Arcueil';
      const postCode = '94110';
      const streetAddress = '44 rue Cauchy';
      const vehicleMake = garageType === GarageTypes.MOTORBIKE_DEALERSHIP ? 'Honda' : 'Renault';
      const model =
        garageType === GarageTypes.CARAVANNING
          ? 'Adria Twin 600 SPB Plus'
          : garageType === GarageTypes.MOTORBIKE_DEALERSHIP
          ? 'CBR'
          : 'Clio';
      const csv =
        'dateinter;genre;fullName;firstName;lastName;email;ville;rue;cp;marque;modele;mobilePhone\n' + // eslint-disable-line prefer-template, max-len
        [
          date,
          gender,
          `${firstName} ${lastName}`,
          firstName,
          lastName,
          email || '',
          city,
          streetAddress,
          postCode,
          vehicleMake,
          model,
          mobilePhone || '',
        ].join(';');
      const defaultId = getExampleGarageId(garageType, lang);
      try {
        const dataTypeForImport = dataType === 'AUTOMATION' ? gsDataFileDataTypes.MAINTENANCES : dataType;
        const campaigns = await promisify((cb) =>
          app.models.DataFile.importFromString(defaultId, dataTypeForImport, csv, cb)
        )();
        if (!campaigns || campaigns.length === 0) {
          return Promise.resolve({ status: 'ko', message: "La campagne n'a pas été créée pour cet email/téléphone" });
        }
        // update language if !== F
        if (lang !== 'fr') {
          const dataFileConnector = app.models.DataFile.getMongoConnector();
          const dataFile = await dataFileConnector.findOne(
            { _id: ObjectID(campaigns[0].dataFileId) },
            { projection: { datasCreatedIds: 1 } }
          );
          if (dataFile && dataFile.datasCreatedIds && dataFile.datasCreatedIds[0]) {
            app.models.Data.getMongoConnector().updateOne(
              { _id: dataFile.datasCreatedIds[0] },
              {
                $set: {
                  'customer.countryCode': {
                    value: lang.toUpperCase(),
                    original: lang.toUpperCase(),
                    isSyntaxOK: true,
                    isEmpty: false,
                  },
                },
              }
            );
          }
        }

        const campaign = campaigns[0];
        if (dataType !== 'AUTOMATION') {
          return new Promise((resolve) => {
            app.models.Campaign.run(campaign.id, (err, res) => {
              if (err) {
                console.error(err);
                resolve({ status: 'ko', message: err.message });
                return;
              }
              resolve({ status: 'ok', message: JSON.stringify({ campaigns }) });
            });
          });
        } else {
          // First, let's get the customer, mainly it's id.
          const customerConnector = app.models.Customer.getMongoConnector();
          const ACConnector = app.models.AutomationCampaign.getMongoConnector();
          const where = {};
          const fields = { projection: { _id: true } };
          where.garageId = new ObjectID(defaultId);
          if (email) where.email = email;
          if (mobilePhone) where.phone = decodePhone(mobilePhone, lang);
          const customer = await customerConnector.findOne(where, fields);
          if (!customer) {
            throw new Error(
              `${
                /null/i.test(email) && isGarageScoreUserByEmail(email)
                  ? 'les emails null@garagescore | null@custeed sont exclus (#4154)'
                  : 'Client final non trouvé (Probablement un bug)'
              }`
            );
          }
          // Then we get the campaign it's attached to
          const automationCampaign = await ACConnector.findOne({
            garageId: new ObjectID(defaultId),
            target: target,
            contactType: email ? AutomationCampaignChannelTypes.EMAIL : AutomationCampaignChannelTypes.MOBILE,
          });
          if (!automationCampaign) {
            throw new Error(
              'Campagne introuvable (Existe-t-elle sur le garage témoin ? (Dupont pour FR, Bosque pour ES etc...)'
            );
          }

          const payload = {
            customerId: customer._id.toString(),
            campaignId: automationCampaign._id.toString(),
            garageId: defaultId.toString(),
            campaignType: automationCampaign.type,
            target: automationCampaign.target,
            contactType: email ? AutomationCampaignChannelTypes.EMAIL : AutomationCampaignChannelTypes.MOBILE,
            campaignRunDay: timeHelper.todayDayNumber(),
            sendGDPRInstantly: true,
          };
          // Then we add a targeted
          await app.models.AutomationCampaignsEvents.addLog({
            ...payload,
            eventType: AutomationCampaignsEventsType.TARGETED,
          });
          // We reset pressure and GDPR
          await customerConnector.updateOne(
            { _id: customer._id },
            { $unset: { hasReceivedGDPRContactAt: true, hasRecentlyBeenContacted: true } }
          );
          // We send the GDPR except if specified otherwise
          if (sendGDPR) {
            await automationSendContactToCustomer({ payload: { ...payload, sendGDPRInstantly: true } });
            await app.models.AutomationCampaignsEvents.addLog({
              ...payload,
              eventType: AutomationCampaignsEventsType.GDPR_SENT,
            });
          }
          // We skip GDPR
          await customerConnector.updateOne({ _id: customer._id }, { $set: { hasReceivedGDPRContactAt: new Date(0) } });
          await automationSendContactToCustomer({ payload: { ...payload, sendGDPRInstantly: true } });
          // Then we add a custom content
          const customContent = await app.models.AutomationCampaign.getCustomContentPayload(
            automationCampaign.customContentId
          );
          await createAddLog(app, defaultId, automationCampaign, customer, AutomationCampaignsEventsType.SENT, email, {
            customContentId: customContent && customContent._id,
          });

          return Promise.resolve({ status: 'ok', message: 'Le / Les contacts Automation sont envoyés avec succès' });
        }
      } catch (e) {
        return Promise.resolve({ status: 'ko', message: e.message });
      }
    },
  },
};
