const { expect } = require('chai');

const {
  MIN_WORKING_HOUR,
  MAX_WORKING_HOUR,
  checkJobDateConstraints,
} = require('../../../../../../common/lib/garagescore/scheduler/jobDateHelpers');

describe('Check Job date constraints', () => {
  let constraints = {};
  beforeEach(() => {
    constraints = {};
  });

  it('Should be OK if no contraints are specified', () => {
    expect(checkJobDateConstraints).to.not.throw();
    expect(() => checkJobDateConstraints(constraints)).to.not.throw();
  });

  it('Should thow if contraints.setMin is out of range', () => {
    constraints.setMin = -1;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
    constraints.setMin = 60;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
  });

  it('Should thow if contraints.setHour is out of range', () => {
    constraints.setMin = 30;

    constraints.setHour = -1;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
    constraints.setHour = 24;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
  });

  it('Should thow if contraints.setHour is out of the workingHours range', () => {
    constraints.setMin = 30;

    constraints.workingHours = true;
    constraints.setHour = MIN_WORKING_HOUR - 1;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
    constraints.setHour = MAX_WORKING_HOUR + 1;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
  });

  it('Should thow if contraints.setDay is out of range', () => {
    constraints.setMin = 30;
    constraints.setHour = 8;

    constraints.setDay = 0;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
    constraints.setDay = 32;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
  });

  it('Should thow if contraints.utc is out of range', () => {
    constraints.setMin = 30;
    constraints.setHour = 8;
    constraints.setDay = 1;

    constraints.utc = -16;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
    constraints.utc = 16;
    expect(() => checkJobDateConstraints(constraints)).to.throw();
  });

  it('Should be OK contraints is well formed', () => {
    constraints.setMin = 30;
    constraints.setHour = Math.floor((MIN_WORKING_HOUR + MAX_WORKING_HOUR) / 2);
    constraints.setDay = 1;
    constraints.utc = 2;
    constraints.workingHours = true;

    expect(() => checkJobDateConstraints(constraints)).to.not.throw();
  });
});
