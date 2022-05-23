import Enum from '~/utils/enum.js'

export default new Enum({
  NEW: 'New',
  IMMINENT: 'Imminent',
  EXCEEDED: 'Exceeded',
}, {
  daysToDelayStatus(days) {
    if (days < 1) return this.NEW;
    else if (days < 4) return this.IMMINENT;
    return this.EXCEEDED;
  },
  getNextStepDelay(delayStatus) { // Example: we are at "NEW" status, how much time before the IMMINENT status ? 3 days !
    if (delayStatus === this.NEW) return 1;
    else if (delayStatus === this.IMMINENT) return 3;
    return null;
  }
});

