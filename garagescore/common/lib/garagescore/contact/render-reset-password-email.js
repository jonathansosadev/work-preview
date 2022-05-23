/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const app = require('../../../../server/server');

const getResetPasswordPayload = async function getResetPasswordPayload(contact) {
  const user = await app.models.User.findById(contact.payload.userId);
  return {
    user,
    token: contact.payload.token,
    locale: await user.getLocale(),
    timezone: await user.getTimezone(),
  };
};

module.exports = {
  getResetPasswordPayload,
};
