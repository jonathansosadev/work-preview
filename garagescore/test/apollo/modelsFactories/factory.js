class ModelFactory {
  // Create a factory for a model
  constructor(model = { create: async (data = {}) => ({ ...data }) }, defaultValuesFn = () => ({})) {
    this.checkConstructorArguments(model, defaultValuesFn);
    
    // model used to registering record in database
    this.model = model;
    
    // function used to generate fake data
    this._rawDataGenerator = defaultValuesFn;

    // number of records to create
    this._createCount = 1;

    // user submitted sequence fields definition
    this._sequenceFields = [];
   
    // current sequence that will be created for this make call
    this._currentSequence = [];
  }


  // returns a model/array of model instance(s) of the entity saved in the database
  async createInDB(properties = {}) {
    if ((this._countSequence() || this._createCount) === 1)
      return this._returnResultsWithEvents(this.model.create(this._generateFields(properties)));

    return this._returnResultsWithEvents(
      Promise.all(
        Array.from(
          { length: this._countSequence() || this._createCount },
          async () => await this.model.create(this._generateFields(properties))
        )
      )
    );
  }

  // set the number of instances to create
  count(count = 1) {
    this._createCount = count;
    return this;
  }

  // Define a sequence for this call
  sequence(sequenceDefinition = []) {
    this._sequenceFields = sequenceDefinition;
    this._generateSequence();
    return this;
  }

  // Define a sequence for this call
  addSequenceStage(count = 1, fields = {}) {
    this._sequenceFields = [...this._sequenceFields, { count, fields }];
    this._generateSequence();
    return this;
  }

  // generate the final fields that will compose the created instance
  _generateFields(properties) {
    return {
      ...this._rawDataGenerator(),
      ...properties,
      ...(this._currentSequence.shift() || {}),
    };
  }

  // generate fields based on an user defined sequence
  _generateSequence() {
    this._currentSequence = this._sequenceFields
      .map((chunk) => Array.from({ length: chunk.count }, () => chunk.fields))
      .reduce((prev, curr) => [...prev, ...curr], []);
  }

  // clear all states that have been created before
  _resetAllStates() {
    this._createCount = 1;
    this._sequenceFields = [];
    this._currentSequence = [];
  }

  // Called after creating all results, it should throw all registered afterCreate callbacks and reset everything
  _returnResultsWithEvents(result) {
    this._resetAllStates();
    return result;
  }

  // Count all iterations in sequence
  _countSequence() {
    return this._sequenceFields.reduce((prev, curr) => prev + curr.count, 0);
  }


  // Throw errors if submitted params are invalid
  checkConstructorArguments(model, rawDataGenerator) {
    if (!model || typeof model.create !== 'function') {
      throw new TypeError("param model should have a method named 'create'");
    }

    if (!rawDataGenerator || typeof rawDataGenerator !== 'function') {
      throw new TypeError('param rawDataGenerator should be a function that return an object');
    }
  }
}

module.exports = ModelFactory;
