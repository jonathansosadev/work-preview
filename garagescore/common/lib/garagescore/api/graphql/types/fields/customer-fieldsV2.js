const graphql = require('graphql');

module.exports = function generateCustomerFields(ticketName) {
  return {
    /** LEAD TICKET CUSTOMER DONE */
    customerFullName: {
      type: graphql.GraphQLString,
      description: 'the customer fullName',
      resolve(data) {
        return data.get(`${ticketName}.customer.fullName`);
      },
    },
    /** LEAD TICKET CUSTOMER CONTACT DONE */
    customerContactMobilePhone: {
      type: graphql.GraphQLString,
      description: 'the customer mobile phone',
      resolve(data) {
        const mobilePhone = data.get(`${ticketName}.customer.contact.mobilePhone`);
        if (mobilePhone && mobilePhone.includes && mobilePhone.includes('0033'))
          return mobilePhone.replace(/^0033/, '0');
        return mobilePhone;
      },
    },
    /** LEAD TICKET CUSTOMER CONTACT DONE */
    customerContactEmail: {
      type: graphql.GraphQLString,
      description: 'the customer email',
      resolve(data) {
        return data.get(`${ticketName}.customer.contact.email`);
      },
    },
    /** CUSTOMER CITY DONE */
    customerCity: {
      type: graphql.GraphQLString,
      description: 'the customer city',
      resolve(data) {
        return data.get('customer.city.value');
      },
    },
  };
};
