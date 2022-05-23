const BillingAccountException = require('../billing-accounts.exception');
const BillingAccountPipelineData = require('./billing-accounts.pipeline.data');

class BillingAccountPipeline {
  constructor(app, expectedFinalOutput = '{BA}') {
    this._app = app;
    this._pipeline = [];
    this._expectedFinalOutput = expectedFinalOutput;
  }

  async run(data) {
    let baData = new BillingAccountPipelineData(data, this._app.models);
    baData.addPattern({ short: 'BA', long: 'billingAccount' });
    baData.addPattern({ short: 'GA', long: 'garage' });
    baData.addPattern({ short: 'OF', long: 'offer' });
    baData.addPattern({ short: 'SU', long: 'subscription' });

    try {
      for (const pipelineStep of this._pipeline) {
        if (!(baData instanceof BillingAccountPipelineData)) {
          throw new BillingAccountException('Fatal in Pipeline::Not instanceof ActionData').serverError();
        }
        baData = await pipelineStep.execute(baData);
      }
    } catch (err) {
      if (!(err instanceof BillingAccountException)) {
        throw new BillingAccountException(err.toString()).serverError();
      } else {
        throw err;
      }
    }

    if (this._expectedFinalOutput && !baData.isMatchingExpectations(this._expectedFinalOutput)) {
      throw new BillingAccountException(`Fatal in Pipeline::Non-valid final output::${baData.error}`).serverError();
    }

    return baData.extract(this._expectedFinalOutput);
  }

  pushBack(baPipelineAction) {
    this._pipeline.push(baPipelineAction);
  }

  pushFront(baPipelineAction) {
    this._pipeline.unshift(baPipelineAction);
  }
}

module.exports = BillingAccountPipeline;
