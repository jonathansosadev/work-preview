module.exports = function AccessHistoryDefinition(AccessHistory) {
  /**
   * Delete all access older than the days given in params
   * @param days
   */
  AccessHistory.cleanAccessOlderThan = async (days) => {
    if (typeof days !== 'number' || !days) {
      return null;
    }
    const before = new Date();
    before.setDate(before.getDate() - days);
    return AccessHistory.destroyAll({ createdAt: { lt: before } });
  };
};
