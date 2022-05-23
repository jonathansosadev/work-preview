const querystring = require('querystring');
const axios = require('axios');

const URL_BASE = `${process.env.ZOHO_API_DOMAIN}/crm/v2`;
const MAX_UPDATES_PER_REQUEST = 100;

let token = null;
let allowUpdate = false;
const pageMin = 1
let pageMax = 500
const logs = []


const addlogs = (data) => {
  console.log(data); // For see the logs directly in the console in case of manual running
  logs.push(data)
}

const getToken = async () => {
  if (token) return token;
  try {
    console.log('Requesting access token...');
    const res = await axios.post(
      `${process.env.ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token`,
      querystring.stringify({
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    token = res.data.access_token;
    console.log(`WE GOT A token! ${token}`);
    return token;
  } catch (e) {
    console.error('getToken ERROR:', e.message);
    console.error(e);
    return '';
  }
};

const get = async (module) => {
  const headers = { headers: { Authorization: `Zoho-oauthtoken ${await getToken()}` } };
  const filteredZohoData = [];
  for (let page = pageMin; page < pageMax; page += 1) {
    const res = await axios.get(`${URL_BASE}/${module}?page=${page}`, headers); // eslint-disable-line no-await-in-loop
    if (!res || !res.data || !res.data.data || !res.data.data.length) return filteredZohoData;
    if (res.data.data.length > 0) filteredZohoData.push(...res.data.data);
  }
  return filteredZohoData;
};

const post = async (module, updates, upsert = false, create = false) => {
  if (!allowUpdate) {
    console.log('POST DISABLED...');
    return;
  }
  const headers = { headers: { Authorization: `Zoho-oauthtoken ${await getToken()}` } };
  let sliceStartAt = 0;
  while (updates.slice(sliceStartAt, sliceStartAt + MAX_UPDATES_PER_REQUEST).length > 0) {
    // Update 100 per 100
    let res = null;
    const requestData = updates.slice(sliceStartAt, sliceStartAt + MAX_UPDATES_PER_REQUEST);
    try {
      if (upsert) {
        res = await axios.post(
          `${URL_BASE}/${module}${create ? '' : '/upsert'}`,
          { data: requestData, wf_trigger: true },
          headers
        ); // eslint-disable-line
      } else {
        res = await axios.put(`${URL_BASE}/${module}`, { data: requestData, wf_trigger: true }, headers); // eslint-disable-line
      }
    } catch (axiosErr) {
      console.error(`ERROR ${upsert ? 'POST' : 'PUT'} AXIOS ${module} -> ${axiosErr && axiosErr.message}`);
      addlogs(
        `ERROR UPDATE ${module} -> FAIL req: ${JSON.stringify(requestData)} || err:  ${JSON.stringify(axiosErr)}`
      );
    }
    if (
      res &&
      res.data &&
      res.data.data &&
      Array.isArray(res.data.data) &&
      res.data.data.filter((d) => d.code !== 'SUCCESS').length > 0
    ) {
      res.data.data
        .filter((d) => d.code !== 'SUCCESS' && module !== 'Contacts_X_Garages')
        .forEach((fail) => {
          // No error for links
          try {
            if (fail.details) {
              const update = updates.find((u) => u.id === fail.details.id);
              if (update)
                addlogs(
                  `ERROR D'UPDATE ${module} -> ${fail.code} - Ajout (${JSON.stringify(update)}) vers zoho (${update.id
                  })`
                );
              else addlogs(`ERROR D'UPDATE ${module} -> ${fail.code} details: (${JSON.stringify(fail)})`);
            } else addlogs(`ERROR D'UPDATE ${module} -> ${fail.code} details: (${JSON.stringify(fail)})`);
          } catch (e) {
            addlogs(e.message);
            console.error(e);
          }
        });
    } else {
      addlogs(
        `ERROR UPDATE ${module} -> res error req: ${JSON.stringify(requestData)} || res: ${JSON.stringify(
          res && res.data
        )}`
      );
    }
    addlogs(`Updating ${module} from ${sliceStartAt} to ${sliceStartAt + MAX_UPDATES_PER_REQUEST}`);
    if (module !== 'Contacts_X_Garages') console.log(JSON.stringify(requestData));
    sliceStartAt += MAX_UPDATES_PER_REQUEST;
  }
};

module.exports = {
  get,
  post,
  activeUpdateMode: () => {
    allowUpdate = true;
    console.error('WARNING: UPDATE MODE ENABLE ! PROD ONLY...');
  },
  setPagesMax: (max) => {
    pageMax = max;
  },
  isAllowUpdate: () => allowUpdate,
  addlogs,
  getLogs: () => logs,
  DEAL_URL: 'https://crm.zoho.com/crm/org321574269/tab/Potentials',
};
