/*
 * Ticket-Action-Factory
 *
 * create a TicketAction object with ease
 *
 *
 */

const timeHelper = require('../../util/time-helper');
const { TicketActionNames } = require('../../../../frontend/utils/enumV2');
const reminderStatus = require('../../../models/data/type/userActions/reminder-status');

class TicketActionFactory {
  constructor(data) {
    let todayDayNumber;

    if (data.dayNumber) {
      todayDayNumber = data.dayNumber;
    } else {
      todayDayNumber = timeHelper.todayDayNumber();
    }
    this.ticketAction = {
      name: data.name ? data.name : '',
      createdAt: data.createdAt ? data.createdAt : new Date(),
      assignerUserId: data.assignerUserId ? data.assignerUserId : '1', // User Id
      assignedUserId: data.assignedUserId ? data.assignedUserId : '2', // User Id
      comment: data.comment ? data.comment : '',
      reminderFirstDay: data.reminderFirstDay ? data.reminderFirstDay : todayDayNumber,
      reminderStatus: data.reminderStatus ? data.reminderStatus : 'notResolved',
      reminderNextDay: data.reminderNextDay ? data.reminderNextDay : todayDayNumber + 1,
    };
  }
  setName(name) {
    this.ticketAction.name = name;
    return this;
  }
  setCreatedAt(createdAt) {
    this.ticketAction.createdAt = createdAt;
    return this;
  }
  setAssigner(userId) {
    this.ticketAction.assignerUserId = userId;
    return this;
  }
  setAssigned(userId) {
    this.ticketAction.assignedUserId = userId;
    return this;
  }
  setComment(comment) {
    this.ticketAction.comment = comment;
    return this;
  }
  setReminderFirstDay(daynumber) {
    this.ticketAction.reminderFirstDay = daynumber;
    return this;
  }
  setReminderStatus(status) {
    this.ticketAction.reminderStatus = status;
    return this;
  }
  setReminderNextDay(daynumber) {
    this.ticketAction.reminderNextDay = daynumber;
    return this;
  }
  static generateRandomTicketAction() {
    function _getRandomNumber(min, max) {
      return Math.floor(Math.random() * max) + min;
    }
    let dayNumber = 0;

    if (Date.now() % 2 === 0) {
      dayNumber = timeHelper.todayDayNumber() + _getRandomNumber(0, 20);
    } else {
      dayNumber = timeHelper.todayDayNumber() - _getRandomNumber(0, 20);
    }

    const validUserAction = [0, 4, 5];
    const randomUserAction = validUserAction[_getRandomNumber(0, validUserAction.length - 1)];
    const randomReminderStatus = _getRandomNumber(0, reminderStatus.values().length - 1);

    const actionName = TicketActionNames.values()[randomUserAction];
    const reminder = reminderStatus[Object.keys(reminderStatus)[randomReminderStatus]];

    return new TicketActionFactory({
      name: actionName,
      reminderFirstDay: dayNumber,
      reminderStatus: reminder,
      reminderNextDay: dayNumber + 1,
    }).getInstance();
  }
  static generateRandomTicketActions(number) {
    const randomTicketActions = [];

    for (let i = 0; i < number; i++) {
      randomTicketActions.push(this.generateRandomTicketAction());
    }

    return randomTicketActions;
  }
  getInstance() {
    return this.ticketAction;
  }
}
module.exports = TicketActionFactory;
