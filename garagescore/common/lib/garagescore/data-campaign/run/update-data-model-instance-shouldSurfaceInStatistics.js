/*
 * Update shouldSurfaceInStatistics of Campaign
 */
function updateShouldSurfaceInStatistics(state, callback) {
  const data = this.modelInstances.data;
  data.set('shouldSurfaceInStatistics', state);
  data.save(callback);
}

module.exports = updateShouldSurfaceInStatistics;
