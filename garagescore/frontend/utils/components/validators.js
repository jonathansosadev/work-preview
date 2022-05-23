import capitalize from 'lodash/capitalize';
import template from 'lodash/template';

const errorMessage = {
  suffix: '[Vue warn]:',
  type: '{<%= componentName %>} Invalid prop:',
  text: 'type check failed for prop <%= propName %>',
  expectation: 'Expected <%= expectedType %>',
  detailedExpectation: 'with value <%= expectedValue %>',
  currentState: 'got <%= valueType %>',
  get baseMessagePrefix() {
    return `${this.suffix} ${this.type} ${this.text}.`;
  },
  get expectedMessageSuffix() {
    return `${this.expectation}, ${this.currentState}.`;
  },
  get detailedExpectedMessageSuffix() {
    const {expectation, detailedExpectation, currentState } = this;
    return `${expectation} ${detailedExpectation}, ${currentState}.`;
  },
  getErrorMessage(options) {
    const { baseMessagePrefix, expectedMessageSuffix } = this;
    const message = `${baseMessagePrefix} ${expectedMessageSuffix}`;
    const compiledMessage = template(message);

    return compiledMessage(options);
  },
  getDetailedErrorMessage(options) {
    const { baseMessagePrefix, expectedMessageSuffix } = this;
    const message = `${baseMessagePrefix} ${expectedMessageSuffix}`;
    const compiledMessage = template(message);

    return compiledMessage(options);
  },
};

export function garagesValidator(
  garages,
  componentName = 'UnknownComponent',
  propName = 'unknownProp'
) {
  if (Array.isArray(garages) || garages === null) {
    return true;
  }

  const options = {
    componentName,
    propName,
    expectedType: 'Array or Null',
    valueType: capitalize(typeof garages),
  };
  console.error(errorMessage.getErrorMessage(options));

  return false;
}
