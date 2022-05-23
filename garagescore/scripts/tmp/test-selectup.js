const soap = require('soap');

const apiUrl = 'http://wsimport2.e-seller.selectup.com/?WSDL&WSImportCRM.asmx?op=CreeLead2';

const leads = [];
/*
soap.createClientAsync(apiUrl)
.then((client) => {
  debugger;
})*/

soap.createClient(apiUrl, (error, client) => {
  if (error) {
    console.error(error.message);
  } else if (client) {
    leads.forEach((lead) => {
      const gsId = lead.gsId;
      delete lead.gsId;
      client.CreeLead2(lead, (err, res) => {
        if (res && res.iIDClientS) {
          console.log('Success : ', res.iIDClientS);
        } else {
          console.error('Fail ! ');
          console.error(res);
          /*
          requestStats.errors.push({
            err: res.sBDServeurS === '<INCONNU>' ? 'Unauthorized' : 'Bad request',
            status: res.sBDServeurS === '<INCONNU>' ? 401 : 400,
            description: res.CreeLead2Result,
          });
*/
        }
      });
    });
  }
});
