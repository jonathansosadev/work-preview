const debug = require('debug')('garagescore:common:models:supervisorMessage'); // eslint-disable-line max-len,no-unused-vars
const moment = require('moment');
const SupervisorMessageType = require('./supervisor-message.type');

module.exports = function SupervisorMessageDefinition(SupervisorMessage) {
  SupervisorMessage.prototype.toString = function toString() {
    // eslint-disable-line no-param-reassign
    if (
      this.type === SupervisorMessageType.EXPORT_AWS_ERROR ||
      this.type === SupervisorMessageType.STATS_SYNCHRONIZE_ERROR ||
      this.type === SupervisorMessageType.CRON_EXECUTION_ERROR
    ) {
      return `${moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS')}: ${this.type} context : ${
        this.payload.context
      } error : ${this.payload.error}`; // eslint-disable-line max-len
    }
    if (this.type === SupervisorMessageType.MESSAGE_QUEUE_ERROR) {
      return `${moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS')}: ${this.type} ${this.payload.queueName}`;
    }
    return `${moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss.SSS')}: ${this.type} ${
      this.payload.context ? ` context : ${this.payload.context}` : ''
    } ${this.payload.error ? ` error : ${this.payload.error}` : ''} ${this.contact ? this.contact.toString() : ''}`; // eslint-disable-line max-len
  };
};
