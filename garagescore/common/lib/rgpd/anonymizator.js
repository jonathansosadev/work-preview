const Data = require('./collections/Data.js');
const Contact = require('./collections/Contact.js');
const Customer = require('./collections/Customer.js');

module.exports = {
  Data, // Data({ dataIds, garageId }, projection = {}, anonymize = false)
  Contact, // Contact({ dataIds }, projection = {}, anonymize = false)
  Customer, // Customer({ phone, email }, projection = {}, anonymize = false)
};
