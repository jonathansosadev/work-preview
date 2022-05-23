/**
  Render an email with ftp credentials
*/
const getFtpCredentialsPayload = async function getFtpCredentialsPayload(contact) {
  return {
    user: contact.payload.user,
    pwd: contact.payload.pwd,
    vuePath: 'internal/ftp-credentials',
  };
};

module.exports = {
  getFtpCredentialsPayload,
};
