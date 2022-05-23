const ContactTicketStatus = require('./type/contact-ticket-status.js');
/**
 * ticket in Qualification des contacts
 */
const model = () => ({
  properties: {
    status: {
      type: ContactTicketStatus.type,
    },
    comments: {
      type: [
        {
          body: { type: 'text' },
          date: { type: 'date' },
          userId: { type: 'string' },
        },
      ],
    },
  },
});

module.exports = { model };
