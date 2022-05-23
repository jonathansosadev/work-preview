const axios = require('axios');

const getFileFromCl1p = async (fileId, { fileType: Accept = 'text/plain' } = {}) => {
  if (typeof fileId !== 'string') {
    throw new Error(`Invalid fileId : ${fileId}`);
  }
  const actualFileId = fileId.split('/').pop();
  const BASE_URL = 'https://api.cl1p.net/';
  const fileUrl = BASE_URL + actualFileId;
  const options = {
    headers: { Accept },
  };
  const result = await axios.get(fileUrl, options);
  if (process.argv.includes('--debug')) {
    console.log('Result GET cl1p');
    console.log(result);
  }
  return result.data;
};

module.exports = { getFileFromCl1p };
