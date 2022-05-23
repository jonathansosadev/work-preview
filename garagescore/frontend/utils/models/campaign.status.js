import Enum from '~/utils/enum.js'

export default new Enum({
  NEW: 'New',
  WAITING: 'Waiting',
  STARTING: 'Starting',
  RUNNING: 'Running',
  RETRY: 'Retry',
  COMPLETE: 'Complete',
  CANCELLED: 'Cancelled'
});

