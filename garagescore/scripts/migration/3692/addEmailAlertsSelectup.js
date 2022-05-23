/*
 ** Script qui ajoute le champs alertEmail(par défaut à true)
 ** pour toutes les configuration selectup des garages
 */
const app = require('../../../server/server.js');

//garages that don't want alerts
//https://github.com/garagescore/garagescore/issues/3692
const garageIdsToSetToFalse = [
  '5e59328a111c70001572a46b',
  '5e5933e5111c70001572a4b9',
  '5e5cf2f59b824b0015b079aa',
  '5e5cf3c29b824b0015b079da',
  '5e593673111c70001572a562',
  '5e5930cd111c70001572a40b',
  '5e5933c7111c70001572a4b3',
  '5e59364c111c70001572a55a',
  '5e5937e5111c70001572a5d7',
  '5e593935111c70001572a75f',
  '5e593cbc111c70001572aaa2',
  '5e5cf47b9b824b0015b07a01',
  '5e5939d9111c70001572a883',
  '5e593b3d111c70001572aa65',
  '5e593c88111c70001572aa99',
  '5e593db1111c70001572aad8',
  '5f15df16831a3c0003336f12',
  '5e593e7f111c70001572aaf4',
  '5e5cef169b824b0015b07889',
];

app.on('booted', async () => {
  try {
    const exportLeadsConfig = await new Promise((res) => {
      app.models.Configuration.getExportLeads(true, (e, confs) => res(confs || []));
    });

    const selectUpConfigIndex = exportLeadsConfig.findIndex((c) => c.name === 'SelectUp');
    if (selectUpConfigIndex === -1) {
      throw new Error('Selectup config not found');
    }

    const updatedSelectUpConfig = Object.fromEntries(
      Object.entries(exportLeadsConfig[selectUpConfigIndex].garages).map(([garageId, config]) => [
        garageId,
        //set emailAlerts to false for garages that don't want alerts
        config.map((c) => {
          if (c.exportedValues) {
            c.exportedValues.emailAlerts = !garageIdsToSetToFalse.includes(garageId);
          }
          return c;
        }),
      ])
    );

    exportLeadsConfig[selectUpConfigIndex].garages = updatedSelectUpConfig;

    await new Promise((resolve, reject) => {
      app.models.Configuration.setExportLeads(exportLeadsConfig, (err) => {
        if (err) {
          reject(`Error occured while updating Selectup config : ${err}`);
        }
        resolve();
      });
    });
  } catch (error) {
    console.log('\033[31m', `Error occured : ${error}`, '\033[0m');
    process.exit(-1);
  } finally {
    console.log('\033[32m', `Successfully updated emailAlerts config for Selectup`, '\033[0m');
    process.exit(0);
  }
});
