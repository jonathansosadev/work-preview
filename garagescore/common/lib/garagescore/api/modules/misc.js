// ---------------- API REVIEWS FUNCTION ---------------- //
module.exports = (API, app) => {
  API.renderContact = async (appId, contactId) => {
    const contact = await app.models.Contact.findById(contactId);
    const contactRendered = await contact.render();
    return contactRendered;
  };
};
