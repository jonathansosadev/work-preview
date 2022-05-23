const axios = require('axios');
const config = require('config');

module.exports = async (worker, count = 1) => {
  if (!config.get('workerbeats.enabled')) {
    return null;
  }
  const u = config.get('workerbeats.url');
  if (!u) {
    console.error('No WORKERBEATS_URL configured');
    return;
  }
  const url = `${u}/${encodeURIComponent(worker)}/${count}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    console.log(url, data);
  } catch (error) {
    console.log(error);
  }
};
