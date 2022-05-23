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
// const createdGarages = [];
// let allExstingGarages = [];
// let billingAccount = null;
//
// let countRowsToProcess = 0;
// let countProcessedRows = 0;
// let countGarageCreated = 0;
// let countGarageUpdated = 0;
// let countGarageIngored = 0;
//
// const commonDms = {
//   uploadFolder: 'SGS',
//   VehicleInspections: {
//     method: 'ftp',
//     fileSuffix: 'csv',
//   },
// };
// const commonImports = [
//   {
//     type: 'VehicleInspections',
//     method: 'FTP',
//     params: {
//       suffix: 'csv',
//       charset: 'utf-8',
//       files: [
//         {
//           path: 'sgs/donnees_client.csv',
//           charset: 'utf-8',
//           enableLastModifiedCheck: true,
//           columnFilter: false,
//           columnFilterSeparator: null,
//           columnFilterColumnNumber: null,
//           columnFilterColumnValue: null,
//         },
//       ],
//     },
//   },
// ];
// const commonSubscriptions = {
//   priceValidated: true,
//   Maintenance: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   NewVehicleSale: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   UsedVehicleSale: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   Lead: {
//     enabled: true,
//     price: 0,
//     date: null,
//   },
//   EReputation: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   VehicleInspection: {
//     enabled: true,
//     price: 9.44,
//     date: null,
//   },
//   Analytics: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   active: true,
//   dateStart: new Date('2021-03-11'),
//   dateEnd: null,
//   setup: {
//     enabled: false,
//     price: 0,
//     monthOffset: 1,
//     billDate: new Date(),
//     alreadyBilled: true,
//   },
//   users: {
//     included: 1,
//     price: 0,
//   },
//   contacts: {
//     bundle: false,
//     included: 0,
//     every: 0,
//     price: 0,
//   },
//   Coaching: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   Connect: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
//   Escalation: {
//     enabled: false,
//     price: 0,
//     date: null,
//   },
// };
// function commonImportSchema(externalId) {
//   return {
//     path: 'generic_csv_utf8',
//     options: {
//       filter: `["CODE_CENTRE"] = "${externalId}" and !["LIBELLE_PRESTA"].includes("CV PV")`,
//       filters: '',
//     },
//   };
// }
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
//     managerEmail: row.values[6] || null,
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
// async function processAlreadyExistingGarage(existingGarage, row) {
//   log.debug(TIBO, `${logPrefix} INFO :: Updating Garage ${existingGarage.publicDisplayName} (${existingGarage._id})`);
//   await app.models.Garage.getMongoConnector().updateOne(
//     {
//       _id: existingGarage._id,
//     },
//     {
//       $set: {
//         publicDisplayName: `(${row.brand}) ${row.name} - ${row.city}`,
//         securedDisplayName: `(${row.brand}) ${row.name} - ${row.city}`,
//         brandNames: [row.brand],
//         logoEmail: [brandLogoFileOnly(row.brand, 60)],
//         logoDirectoryPage: [brandLogoFileOnly(row.brand, 90)],
//         streetAddress: `${row.streetAddress}${row.streetAddressBis ? `, ${row.streetAddressBis}` : ''}`,
//         dms: commonDms,
//         importSchema: commonImportSchema(row.externalId),
//         imports: commonImports,
//         subscriptions: commonSubscriptions,
//         ratingType: 'stars',
//         bizDevId: olivierId,
//         performerId: martinId,
//         status: GarageStatus.RUNNING_MANUAL,
//         updatedAt: new Date(),
//         tva: 20,
//         locale: 'fr_FR',
//         timezone: 'Europe/Paris',
//         certificateWording: 'appointment',
//         ...getSetFromRow(row, existingGarage, true),
//       },
//     }
//   );
//   ++countGarageUpdated;
// }
//
// async function processNewGarage(row) {
//   log.debug(TIBO, `${logPrefix} INFO :: Creating New Garage (${row.brand}) ${row.name} - ${row.city}`);
//   const slug = `${slugify(row.brand)}-${slugify(row.name)}-${slugify(row.city || 'unknowncity')}`;
//   //const duplicateSlugs = await app.models.Garage.find({ where: { slug } });
//
//   // Let's setup our document
//   const newGarage = {
//     type: GarageTypes.VEHICLE_INSPECTION,
//     slug,
//     publicDisplayName: `(${row.brand}) ${row.name} - ${row.city}`,
//     securedDisplayName: `(${row.brand}) ${row.name} - ${row.city}`,
//     brandNames: [row.brand],
//     logoEmail: [brandLogoFileOnly(row.brand, 60)],
//     logoDirectoryPage: [brandLogoFileOnly(row.brand, 90)],
//     googleCampaignActivated: false,
//     googleCampaignLock: false,
//     streetAddress: `${row.streetAddress}${row.streetAddressBis ? `, ${row.streetAddressBis}` : ''}`,
//     manager: {
//       lastName: row.manager.split(' ').slice(0, -1).join(' '),
//       firstName: row.manager.split(' ').pop(),
//       job: 'Directeur de centre',
//       phone: null,
//     },
//     managerApv: {
//       lastName: '',
//       firstName: '',
//       job: '',
//       phone: null,
//     },
//     managerVn: {
//       lastName: '',
//       firstName: '',
//       job: '',
//       phone: null,
//     },
//     managerVo: {
//       lastName: '',
//       firstName: '',
//       job: '',
//       phone: null,
//     },
//     usersQuota: 5,
//     surveySignature: {
//       useDefault: true,
//       defaultSignature: {
//         lastName: row.manager.split(' ').slice(0, -1).join(' '),
//         firstName: row.manager.split(' ').pop(),
//         job: 'Directeur de centre',
//       },
//     },
//     dms: commonDms,
//     importSchema: commonImportSchema(row.externalId),
//     imports: commonImports,
//     subscriptions: commonSubscriptions,
//     ratingType: 'stars',
//     bizDevId: olivierId,
//     performerId: martinId,
//     status: GarageStatus.RUNNING_MANUAL,
//     group: 'SGS',
//     updatedAt: new Date(),
//     createdAt: new Date(),
//     tva: 20,
//     locale: 'fr_FR',
//     timezone: 'Europe/Paris',
//     certificateWording: 'appointment',
//     zohoDealUrl: '',
//     disableZohoUrl: true,
//     annexGarageId: null,
//     hideDirectoryPage: true,
//     disableAutoAllowCrawlers: false,
//     updateFrequency: 'never',
//     runningSince: new Date(),
//     enrichScriptEnabled: false,
//     thresholds: {
//       alertSensitiveThreshold: {
//         maintenance: 6,
//         sale_new: 6,
//         sale_used: 6,
//         vehicle_inspection: 6,
//       },
//     },
//     shareReviews: true,
//     postOnGoogleMyBusiness: true,
//     exogenousReviewsConfigurations: {
//       Google: {
//         connectedBy: '',
//         error: '',
//         token: '',
//         externalId: '',
//         lastError: null,
//         lastRefresh: null,
//         lastFetch: null,
//       },
//       PagesJaunes: {
//         connectedBy: '',
//         error: '',
//         token: '',
//         externalId: '',
//         lastError: null,
//         lastRefresh: null,
//         lastFetch: null,
//       },
//       Facebook: {
//         connectedBy: '',
//         error: '',
//         token: '',
//         externalId: '',
//         lastError: null,
//         lastRefresh: null,
//         lastFetch: null,
//       },
//     },
//     parent: {
//       garageId: '',
//       shareLeadTicket: {
//         enabled: false,
//         NewVehicleSale: false,
//         UsedVehicleSale: false,
//       },
//     },
//     ticketsConfiguration: {
//       VehicleInspection: null,
//     },
//     campaignScenarioId: getDefaultScenarioId(GarageTypes.VEHICLE_INSPECTION),
//     automaticBillingSubscriptionIds: [],
//     needGoogleRatingImprovement: false,
//     subRegion: '',
//     region: '',
//     brandName: '',
//     monthPriceHistory: [],
//     selectup: {},
//     ...getSetFromRow(row, false),
//     googlePlaceHistory: [],
//     dataFirstDays: {
//       firstMaintenanceDay: null,
//       firstNewVehicleSaleDay: null,
//       firstUsedVehicleSaleDay: null,
//     },
//     googlePlace: {
//       ...(row.googlePlaceId ? { id: row.googlePlaceId } : {}),
//     },
//   };
//
//   // Create the garage
//   //const garage = await billingAccount.garages.create(newGarage);
//
//   // Assign the garage to the god users and stuff
//   //await setUserAssignNewGarage(app, olivierId, garage.getId());
//
//   // Slug is already taken, we'll add the garageId to it
//   /*  if (duplicateSlugs.length) {
//     await garage.updateAttributes({ slug: `${slug}-${garage.id}` });
//   }*/
//
//   createdGarages.push(newGarage);
//   ++countGarageCreated;
// }
//
// async function processRow(rawRow, brand) {
//   const row = { ...extractRowInformation(rawRow), brand };
//   let existingGarage = null;
//
//   if (!row.externalId) {
//     log.warning(TIBO, `${logPrefix} WARNING :: Ignoring Row Without ExternalID ! ${JSON.stringify(rawRow.values)}`);
//   } else {
//     existingGarage = allExstingGarages.find(
//       (g) =>
//         // Not already used
//         !g.used &&
//         // Now we search for a match
//         // Maybe the externalId is already setup in the garage
//         ((g.externalId && g.externalId.toUpperCase() === row.externalId.toUpperCase()) ||
//           // Or if it is not maybe we will find it in the importSchema
//           (g.importSchema &&
//             g.importSchema.options &&
//             g.importSchema.options.filter &&
//             g.importSchema.options.filter.toUpperCase().includes(row.externalId.toUpperCase())) ||
//           // And finally, if it does not have an importSchema with CODE_CENTRE and only if does not have an importSchema with CODE_CENTRE we can check
//           // the googlePlaceId or the businessId
//           ((!g.importSchema ||
//             !g.importSchema.options ||
//             !g.importSchema.options.filter ||
//             !g.importSchema.options.filter.includes('CODE_CENTRE')) &&
//             ((g.googlePlaceId && g.googlePlaceId === row.googlePlaceId) ||
//               (g.businessId && g.businessId === row.businessId))))
//     );
//
//     if (existingGarage) {
//       await processAlreadyExistingGarage(existingGarage, row);
//       existingGarage.used = true;
//     } else {
//       await processNewGarage(row);
//     }
//   }
// }
//
// app.on('booted', async () => {
//   try {
//     const workbook = new ExcelJS.Workbook();
//
//     // Fetch all the existing SGS VI, some of them will be updated
//     allExstingGarages = await app.models.Garage.getMongoConnector()
//       .find(
//         {
//           type: GarageTypes.VEHICLE_INSPECTION,
//           $or: [{ group: 'sgs' }, { group: 'SGS' }, { group: 'Synapse' }],
//         },
//         {
//           projection: {
//             _id: true,
//             publicDisplayName: true,
//             importSchema: true,
//             businessId: true,
//             googlePlaceId: true,
//             externalId: true,
//             group: true,
//             zohoDealUrl: true,
//             surveySignature: true,
//             manager: true,
//           },
//         }
//       )
//       .toArray();
//
//     // We fetch the billing account to which we going to plus the garages
//     billingAccount = await app.models.BillingAccount.findById(billingAccountId, { include: ['garages'] });
//     if (!billingAccount) {
//       throw new Error('BillingAccount Not Found !');
//     }
//
//     log.info(TIBO, `${logPrefix} INFO :: Found ${allExstingGarages.length} Existing SGS Garages In Database`);
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
//               log.info(
//                 TIBO,
//                 `${logPrefix} INFO :: (${Math.floor(
//                   (countProcessedRows / countRowsToProcess) * 100
//                 )}%) ${countProcessedRows} Rows Processed, ${countRowsToProcess - countProcessedRows} Remaining`
//               );
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
//       `${logPrefix} INFO :: Done ! ${countGarageCreated} Garages Created, ${countGarageUpdated} Garages Updated, ${countGarageIngored} Garages Ignored.`
//     );
//     for (const garage of allExstingGarages) {
//       if (!garage.used) {
//         log.warning(
//           TIBO,
//           `${logPrefix} WARNING :: This Existing Garage Did Not Find Any Match In File : ${garage._id}`
//         );
//       }
//     }
//
//     await app.models.Garage.getMongoConnector().insertMany(createdGarages);
//
//     allExstingGarages = await app.models.Garage.getMongoConnector()
//       .find(
//         {
//           type: GarageTypes.VEHICLE_INSPECTION,
//           $or: [{ group: 'sgs' }, { group: 'SGS' }, { group: 'Synapse' }],
//         },
//         {
//           projection: {
//             _id: true,
//             slug: true,
//           },
//         }
//       )
//       .toArray();
//
//     for (const garage of allExstingGarages) {
//       if (allExstingGarages.find((g) => g.slug === garage.slug && g._id.toString() !== garage._id.toString())) {
//         log.warning(TIBO, `WARNING :: Duplicate Slug, Updating It (${garage.slug})`);
//         await app.models.Garage.getMongoConnector().updateOne(
//           { _id: garage._id },
//           { $set: { slug: `${garage.slug}-${garage._id}` } }
//         );
//       }
//     }
//
//     allExstingGarages = await app.models.Garage.getMongoConnector()
//       .find(
//         {
//           type: GarageTypes.VEHICLE_INSPECTION,
//           $or: [{ group: 'sgs' }, { group: 'SGS' }, { group: 'Synapse' }],
//         },
//         {
//           projection: {
//             _id: true,
//             slug: true,
//           },
//         }
//       )
//       .toArray();
//
//     for (const garage of allExstingGarages) {
//       if (allExstingGarages.find((g) => g.slug === garage.slug && g._id.toString() !== garage._id.toString())) {
//         log.warning(TIBO, `WARNING :: Duplicate Slug, Updating It (${garage.slug})`);
//         await app.models.Garage.getMongoConnector().updateOne(
//           { _id: garage._id },
//           { $set: { slug: `${garage.slug}-${garage._id}` } }
//         );
//       }
//     }
//
//     const custeedUsers = await app.models.User.getMongoConnector()
//       .find(
//         { email: { $regex: /(@garagescore.com|@custeed.com)/i } },
//         { projection: { _id: true, garageIds: true, availableGarageIds: true } }
//       )
//       .toArray();
//
//     log.info(TIBO, `INFO :: Found ${custeedUsers.length} Custeed Users`);
//
//     await Promise.all(
//       custeedUsers.map(async (user) => {
//         let hasChange = false;
//
//         for (const garage of allExstingGarages) {
//           if (!user.garageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//             user.garageIds.push(new ObjectID(garage._id));
//             hasChange = true;
//           }
//           if (!user.availableGarageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//             user.availableGarageIds.push(new ObjectID(garage._id));
//             hasChange = true;
//           }
//         }
//         if (hasChange) {
//           log.info(TIBO, `INFO :: Adding Garages To User ${user._id}`);
//           await app.models.User.getMongoConnector().updateOne(
//             { _id: user._id },
//             { $set: { garageIds: user.garageIds, availableGarageIds: user.availableGarageIds } }
//           );
//         }
//       })
//     );
//
//     log.info(TIBO, `INFO :: Updating BillingAccount...`);
//
//     billingAccount = await app.models.BillingAccount.getMongoConnector().findOne({
//       _id: new ObjectID(billingAccountId),
//     });
//
//     for (const garage of allExstingGarages) {
//       if (!billingAccount.garageIds.map((id) => id.toString()).includes(garage._id.toString())) {
//         billingAccount.garageIds.push(new ObjectID(garage._id));
//       }
//     }
//
//     await app.models.BillingAccount.getMongoConnector().updateOne(
//       { _id: new ObjectID(billingAccountId) },
//       { $set: { garageIds: billingAccount.garageIds } }
//     );
//
//     process.exit(0);
//   } catch (e) {
//     log.error(TIBO, `${logPrefix} ERROR :: ${e.stack}`);
//     process.exit(1);
//   }
// });
