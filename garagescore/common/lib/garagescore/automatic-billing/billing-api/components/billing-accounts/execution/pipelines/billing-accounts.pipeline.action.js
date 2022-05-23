const { promisify } = require('util');
class BillingAccountPipelineAction {
  constructor(func, expectedInputs, expectedOutputs) {
    this._func = promisify(func);
    this._expectedInputs = expectedInputs;
    this._expectedOutputs = expectedOutputs;
  }

  async execute(data) {
    if (!data.isMatchingExpectations(this._expectedInputs)) {
      throw new Error(`BAD REQUEST: ${this._func.name}::Did not match expected INPUTS::CannotProcess::${data.error}`);
    }
    const result = await this._func(data);
    if (!data.enrich(result, this._expectedOutputs)) {
      throw new Error(`${this._func.name}::Did not match expected OUTPUTS::NotFound::${data.error}`);
    }
    if (!data.isMatchingExpectations(this._expectedOutputs)) {
      throw new Error(`${this._func.name}::Did not match expected OUTPUTS::NotFound::${data.error}`);
    }
    return data;
  }
}

module.exports = BillingAccountPipelineAction;
