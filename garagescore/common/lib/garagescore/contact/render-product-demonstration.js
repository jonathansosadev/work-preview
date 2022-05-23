/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const app = require('../../../../server/server');

const getProductDemonstrationPayload = async (contact) => {
  const { payload } = contact;
  payload.vuePath = 'notifications/product-demonstration';

  const user = await app.models.User.findById(
    contact.payload.userId, 
    { fields: { firstName: true, lastName: true, email: true, phone: true, mobilePhone: true, businessName: true } 
  } );
  if (!user) return {};

  payload.name = user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : null;
  payload.email = user.email ? user.email : null;
  payload.phone = user.phone ? user.phone : (user.mobilePhone ? user.mobilePhone : null);
  payload.businessName = user.businessName ? user.businessName : null;
  return payload;
};

module.exports = {
  getProductDemonstrationPayload,
};
