// DO NOT USE LIKE THIS, It's no longer up to date, availableGarageIds, parentId and ancestors do not exists since #4511
// const ExcelJS = require('exceljs');
// const slugify = require('@sindresorhus/slugify');
// const { ObjectID } = require('mongodb');
//
// const app = require('../../server/server');
// const GarageStatus = require('../../common/models/garage.status');
// const GarageTypes = require('../../common/models/garage.type');
// const { brandLogoFileOnly } = require('../../common/lib/garagescore/garage/logo');
// const { getDefaultScenarioId } = require('../../common/lib/util/app-config.js');
// const { TIBO, log } = require('../../common/lib/util/log');
//
// // CT Exemple : 5dbfe44e20c7a80015571ea5
//
// const logPrefix = '[Import-SGS-Garages] ::';
// const fileName = process.argv[2];
// const billingAccountId = '5beae9648f4e920014f20e55';
// const olivierId = '55f1895fb592111900363573';
// const martinId = '5a86bd4cfa93690013c41324';
//
// const createdUsers = [];
// const updatedUsers = [];
// const updatedGarages = [];
// let allExistingGarages = [];
// let allExistingUsers = [];
// let commonParent = null;
//
// let countRowsToProcess = 0;
// let countProcessedRows = 0;
// let countUserCreated = 0;
// let countUserUpdated = 0;
//
// let insertManyResult = {};
// let bulkWriteResult = {};
//
// function capitalize(str) {
//   if (!str) {
//     return null;
//   }
//   return str
//     .trim()
//     .toLowerCase()
//     .replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
// }
// function frenchPhone(phone) {
//   if (!phone) {
//     return null;
//   }
//   return phone.replace(/(.{2})/g, '$1 ');
// }
// function extractRowInformation(row) {
//   return {
//     externalId: (row.values[2] && row.values[2].slice(1)) || null,
//     businessId: row.values[3] || null,
//     name: capitalize(row.values[4] || null),
//     manager: capitalize(row.values[5] || null),
//     managerEmail: typeof row.values[6] === 'string' ? row.values[6] : (row.values[6] && row.values[6].text) || null,
//     streetAddress: capitalize(row.values[7] || null),
//     streetAddressBis: capitalize(row.values[8] || null),
//     postalCode: row.values[9] || null,
//     city: capitalize(row.values[10] || null),
//     phone: frenchPhone(capitalize(row.values[11] || null)),
//     website: row.values[12] || null,
//     googlePlaceId: row.values[15] && row.values[15].split('placeid=').pop(),
//   };
// }
// function getSetFromRow(row, existingGarage, fromUpdate) {
//   const set = {};
//
//   if (row.googlePlaceId) {
//     set.googlePlaceId = row.googlePlaceId;
//   }
//
//   if (row.postalCode) {
//     set.postalCode = row.postalCode;
//   }
//
//   if (row.city) {
//     set.city = row.city;
//   }
//
//   if (row.phone) {
//     set.phone = row.phone;
//   }
//
//   if (row.website) {
//     set.links = [{ name: 'appointment', url: row.website }];
//   }
//
//   if (row.externalId) {
//     set.externalId = row.externalId;
//   }
//
//   if (row.businessId) {
//     set.businessId = row.businessId;
//   }
//
//   if (fromUpdate && row.googlePlaceId) {
//     set['googlePlace.id'] = row.googlePlaceId;
//   }
//
//   if (fromUpdate && existingGarage.group === 'sgs') {
//     set.group = 'SGS';
//   }
//
//   if (fromUpdate && !existingGarage.zohoDealUrl) {
//     set.disableZohoUrl = true;
//   }
//
//   if (fromUpdate && (!existingGarage.manager || !existingGarage.manager.lastName)) {
//     set.manager = {
//       lastName: row.manager.split(' ').slice(0, -1).join(' '),
//       firstName: row.manager.split(' ').pop(),
//       job: 'Directeur de centre',
//       phone: null,
//     };
//   }
//
//   if (
//     fromUpdate &&
//     (!existingGarage.surveySignature ||
//       !existingGarage.surveySignature.defaultSignature ||
//       !existingGarage.surveySignature.defaultSignature.lastName)
//   ) {
//     set.surveySignature = {
//       useDefault: true,
//       defaultSignature: {
//         lastName: row.manager.split(' ').slice(0, -1).join(' '),
//         firstName: row.manager.split(' ').pop(),
//         job: 'Directeur de centre',
//       },
//     };
//   }
//
//   return set;
// }
// function isHeader(rawRow) {
//   return rawRow.values.includes('NOM COMMERCIAL') || rawRow.values.includes('CODE POSTAL');
// }
//
// function processAlreadyExistingUser(existingUser, row, garage, pushInUpdated = true) {
//   log.debug(TIBO, `${logPrefix} INFO :: Updating User ${existingUser.email}`);
//
//   if (!existingUser.availableGarageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//     existingUser.availableGarageIds.push(garage._id);
//   }
//
//   if (!existingUser.garageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//     existingUser.garageIds.push(garage._id);
//   }
//
//   if (pushInUpdated) {
//     updatedUsers.push(existingUser);
//   }
// }
//
// function processNewUser(row, garage) {
//   log.debug(TIBO, `${logPrefix} INFO :: Creating New User ${row.managerEmail}`);
//   const lastName = row.manager.split(' ').slice(0, -1).join(' ');
//   const firstName = row.manager.split(' ').pop();
//   const job = 'Directeur de centre';
//
//   createdUsers.push({
//     password: Math.random().toString(36).substr(2),
//     email: row.managerEmail,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     subscriptionStatus: 'Terminated',
//     search: `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
//     civility: 'M',
//     phone: '',
//     mobilePhone: '',
//     address: `${row.streetAddress}${row.streetAddressBis ? ` ${row.streetAddressBis}` : ''}`,
//     postCode: row.postalCode || '',
//     businessName: row.name || '',
//     job,
//     city: row.city || '',
//     lastName,
//     firstName,
//     authorization: {
//       ACCESS_TO_COCKPIT: false,
//       ACCESS_TO_SATISFACTION: false,
//       ACCESS_TO_UNSATISFIED: false,
//       ACCESS_TO_LEADS: false,
//       ACCESS_TO_CONTACTS: false,
//       ACCESS_TO_E_REPUTATION: false,
//       ACCESS_TO_ESTABLISHMENT: false,
//       ACCESS_TO_TEAM: false,
//       ACCESS_TO_ADMIN: false,
//       WIDGET_MANAGEMENT: false,
//       ACCESS_TO_WELCOME: false,
//       ACCESS_TO_AUTOMATION: false,
//     },
//     authRequest: {
//       ACCESS_TO_E_REPUTATION: false,
//     },
//     firstVisit: {
//       REPUTATION: false,
//     },
//     allGaragesAlerts: {
//       Lead: false,
//       UnsatisfiedVn: false,
//       UnsatisfiedVo: false,
//       UnsatisfiedMaintenance: false,
//       unsatisfiedVo: false,
//       LeadVn: false,
//       LeadVo: false,
//       UnsatisfiedFollowup: false,
//       ExogenousNewReview: false,
//       UnsatisfiedVI: true,
//       EscalationUnsatisfiedVi: true,
//       EscalationUnsatisfiedMaintenance: false,
//       EscalationUnsatisfiedVn: false,
//       EscalationUnsatisfiedVo: false,
//       EscalationLeadVn: false,
//       EscalationLeadVo: false,
//       EscalationLeadMaintenance: false,
//       LeadApv: false,
//     },
//     lastCockpitOpenAt: null,
//     lastCockpitOpenWithBackdoorAt: null,
//     remainingLoginAttemptBeforeCaptcha: 3,
//     garageIds: [garage._id],
//     availableGarageIds: [garage._id],
//     groupIds: [],
//     trolled: null,
//     cockpitType: 'VehicleInspection',
//     reportConfigs: {
//       daily: {
//         lead: false,
//         unsatisfiedApv: false,
//         unsatisfiedVn: false,
//         unsatisfiedVo: false,
//         leadVo: false,
//         leadVn: false,
//         unsatisfiedFollowup: false,
//         enable: false,
//         generalVue: false,
//         UnsatisfiedVI: false,
//       },
//       weekly: {
//         lead: false,
//         unsatisfiedApv: false,
//         unsatisfiedVn: false,
//         unsatisfiedVo: false,
//         leadVn: false,
//         leadVo: false,
//         unsatisfiedFollowup: false,
//         enable: false,
//         generalVue: false,
//         UnsatisfiedVI: false,
//       },
//       monthly: {
//         lead: false,
//         unsatisfiedApv: false,
//         unsatisfiedVn: false,
//         unsatisfiedVo: false,
//         leadVo: false,
//         leadVn: false,
//         unsatisfiedFollowup: true,
//         enable: true,
//         generalVue: true,
//         UnsatisfiedVI: true,
//       },
//       monthlySummary: {
//         enable: false,
//       },
//     },
//     profiles: [],
//     accounts: [],
//     lastOpenAt: {
//       COCKPIT_REVIEWS: null,
//       COCKPIT_UNSATISFIED: null,
//       ADMIN: null,
//       COCKPIT_CONTACTS: null,
//       COCKPIT_LEAD: null,
//       'COCKPIT_E-REPUTATION': null,
//       ANALYTICS: null,
//     },
//     accessCount: 0,
//   });
// }
//
// function processParent(garage) {
//   if (!commonParent.availableGarageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//     commonParent.availableGarageIds.push(garage._id);
//   }
//
//   if (!commonParent.garageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//     commonParent.garageIds.push(garage._id);
//   }
// }
//
// async function processRow(rawRow, brand) {
//   const row = { ...extractRowInformation(rawRow), brand };
//   const existingGarage = allExistingGarages.find((garage) => garage.externalId === row.externalId);
//   let existingUser = updatedUsers.find((user) => user.email === row.managerEmail);
//   let pushInUpdated = false;
//
//   if (!existingUser) {
//     existingUser = createdUsers.find((user) => user.email === row.managerEmail);
//   }
//
//   if (!existingUser) {
//     existingUser = allExistingUsers.find((user) => user.email === row.managerEmail);
//     pushInUpdated = true;
//   }
//
//   if (!existingGarage) {
//     log.warning(TIBO, `${logPRefix} WARNING :: Ignoring Row, Garage Not Found With ExternalId ${row.externalId}`);
//   } else if (!row.externalId) {
//     log.warning(TIBO, `${logPrefix} WARNING :: Ignoring Row Without ExternalID ! ${JSON.stringify(rawRow.values)}`);
//   } else {
//     if (existingUser) {
//       processAlreadyExistingUser(existingUser, row, existingGarage, pushInUpdated);
//     } else {
//       processNewUser(row, existingGarage);
//     }
//     processParent(existingGarage);
//   }
// }
//
// app.on('booted', async () => {
//   try {
//     const workbook = new ExcelJS.Workbook();
//
//     // Fetch all the existing SGS VI, some of them will be updated
//     allExistingGarages = await app.models.Garage.getMongoConnector()
//       .find(
//         {
//           type: GarageTypes.VEHICLE_INSPECTION,
//           $or: [{ group: 'SGS' }, { group: 'Synapse' }],
//         },
//         {
//           projection: {
//             _id: true,
//             publicDisplayName: true,
//             externalId: true,
//             ticketsConfiguration: true,
//           },
//         }
//       )
//       .toArray();
//
//     allExistingUsers = await app.models.User.getMongoConnector()
//       .find(
//         {},
//         {
//           projection: {
//             _id: true,
//             email: true,
//             garageIds: true,
//             availableGarageIds: true,
//             parentId: true,
//           },
//         }
//       )
//       .toArray();
//
//     // Adding Adelaide to the updated Users because we will certainly update her
//     commonParent = allExistingUsers.find((user) => user.email === 'adelaide.landeau@sgs.com');
//     updatedUsers.push(commonParent);
//
//     log.info(TIBO, `${logPrefix} INFO :: Found ${allExistingGarages.length} Existing SGS Garages In Database`);
//     log.info(TIBO, `${logPrefix} INFO :: Found ${allExistingUsers.length} Existing Users In Database`);
//
//     log.info(TIBO, `${logPrefix} INFO :: Reading From File ${fileName}`);
//     await workbook.xlsx.readFile(fileName);
//
//     // Let's do a first quick loop just for print and user friendship purpose
//     for (const worksheet of workbook._worksheets) {
//       if (worksheet && worksheet._rows) {
//         for (const workrow of worksheet._rows) {
//           if (workrow && workrow.values && !isHeader(workrow)) {
//             ++countRowsToProcess;
//           }
//         }
//       }
//     }
//
//     log.info(TIBO, `${logPrefix} INFO :: Found ${countRowsToProcess} Rows To Process`);
//
//     // We loop through every sheet and every row and we process them
//     for (const worksheet of workbook._worksheets) {
//       if (worksheet && worksheet._rows) {
//         for (const workrow of worksheet._rows) {
//           if (workrow && workrow.values) {
//             if (!isHeader(workrow)) {
//               await processRow(workrow, worksheet.name);
//               ++countProcessedRows;
//               /*              log.info(
//                 TIBO,
//                 `${logPrefix} INFO :: (${Math.floor(
//                   (countProcessedRows / countRowsToProcess) * 100
//                 )}%) ${countProcessedRows} Rows Processed, ${countRowsToProcess - countProcessedRows} Remaining`
//               );*/
//             } else {
//               log.warning(TIBO, `${logPrefix} WARNING :: Ignoring Row ${JSON.stringify(workrow.values || [])}`);
//             }
//           }
//         }
//       }
//     }
//
//     // Job is done let's print some information
//     log.info(
//       TIBO,
//       `${logPrefix} INFO :: Almost Done ! ${createdUsers.length} Users To Create, ${updatedUsers.length} Users To Update.`
//     );
//
//     bulkWriteResult = await app.models.User.getMongoConnector().bulkWrite(
//       updatedUsers.map((user) => {
//         return {
//           updateOne: {
//             filter: {
//               _id: user._id,
//             },
//             update: {
//               $set: {
//                 garageIds: user.garageIds,
//                 availableGarageIds: user.availableGarageIds,
//                 updatedAt: new Date(),
//               },
//             },
//           },
//         };
//       })
//     );
//
//     if (createdUsers.length) {
//       insertManyResult = await app.models.User.getMongoConnector().insertMany(createdUsers);
//     }
//
//     log.info(
//       TIBO,
//       `${logPrefix} INFO :: ${insertManyResult.insertedCount} Users Created, ${bulkWriteResult.modifiedCount} Users Updated.`
//     );
//
//     allExistingUsers = await app.models.User.getMongoConnector()
//       .find(
//         {},
//         {
//           projection: {
//             _id: true,
//             email: true,
//             garageIds: true,
//             availableGarageIds: true,
//             parentId: true,
//           },
//         }
//       )
//       .toArray();
//
//     for (const worksheet of workbook._worksheets) {
//       if (worksheet && worksheet._rows) {
//         for (const workrow of worksheet._rows) {
//           if (workrow && workrow.values) {
//             if (!isHeader(workrow)) {
//               const row = { ...extractRowInformation(workrow), brand: worksheet.name };
//               const existingGarage = allExistingGarages.find((garage) => garage.externalId === row.externalId);
//               const existingUser = allExistingUsers.find((user) => user.email === row.managerEmail);
//
//               if (!existingGarage) {
//                 throw new Error(`Unable to find garage ${row.externalId}`);
//               }
//
//               if (!existingUser) {
//                 throw new Error(`Unable to find user ${row.managerEmail}`);
//               }
//
//               updatedGarages.push({ _id: existingGarage._id, manager: existingUser._id });
//             }
//           }
//         }
//       }
//     }
//
//     bulkWriteResult = await app.models.Garage.getMongoConnector().bulkWrite(
//       updatedGarages.map((garage) => {
//         return {
//           updateOne: {
//             filter: {
//               _id: garage._id,
//             },
//             update: {
//               $set: {
//                 ticketsConfiguration: {
//                   VehicleInspection: garage.manager,
//                 },
//                 updatedAt: new Date(),
//               },
//             },
//           },
//         };
//       })
//     );
//
//     log.info(TIBO, `${logPrefix} INFO :: ${bulkWriteResult.modifiedCount} Garages Updated.`);
//
//     process.exit(0);
//   } catch (e) {
//     log.error(TIBO, `${logPrefix} ERROR :: ${e.stack}`);
//     process.exit(1);
//   }
// });
