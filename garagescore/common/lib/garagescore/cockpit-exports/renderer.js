const getCockpitExportEmailPayload = async function getCockpitExportEmailPayload(contact) {
  return { ...contact.payload, timezone: 'Europe/Paris' };
};

module.exports = {
  getCockpitExportEmailPayload,
};
