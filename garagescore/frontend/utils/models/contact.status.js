import Enum from '~/utils/enum.js'

export default new Enum({
  WAITING: 'Waiting',
  SEND: 'Send',
  FAILED: 'Failed',
  SKIPPED: 'Skipped',
  BOUNCED: 'Bounced',
  CLICKED: 'Clicked',
  COMPLAINED: 'Complained',
  DELIVERED: 'Delivered',
  DROPPED: 'Dropped',
  OPENED: 'Opened',
  UNSUBSCRIBED: 'Unsubscribed',
  IGNORED: 'Ignored',
});

