import Enum from '~/utils/enum.js'

export default new Enum({
  EMAIL_SEND: 'email.send',
  EMAIL_BOUNCE: 'email.bounce',
  EMAIL_CLICK: 'email.click',
  EMAIL_COMPLAINT: 'email.complaint',
  EMAIL_DELIVERY: 'email.delivery',
  EMAIL_DROP: 'email.drop',
  EMAIL_OPEN: 'email.open',
  EMAIL_UNSUBSCRIBE: 'email.unsubscribe',
  SMS_SEND: 'sms.send',
  SMS_DROP: 'sms.drop',
  SMS_UNSUBSCRIBE: 'sms.unsubscribe'
});

