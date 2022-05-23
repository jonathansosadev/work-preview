const { ObjectID } = require('mongodb');
const chai = require('chai');
const serializer = require('../../../../../common/lib/util/serializer');

const expect = chai.expect;

describe('Serializer Util', () => {
  it('Should Serialize And Deserialize Date OK', async () => {
    const payload = { foo: 'bar', toto: { 'lele.lolo.lulu': new Date() }, jee: 42, sus: new Date() };

    const result = serializer.deserialize(serializer.serialize(payload));

    expect(result.foo).to.equals('bar');
    expect(result.jee).to.equals(42);
    expect(result.sus).to.be.an.instanceof(Date);
    expect(result.toto['lele.lolo.lulu']).to.be.an.instanceof(Date);
  });

  it('Should Serialize And Deserialize ObjectID OK', async () => {
    const payload = {
      foo: 'bar',
      toto: { 'lele.lolo.lulu': [new ObjectID(), new ObjectID()] },
      jiz: new ObjectID().toString(),
      jee: 42,
      sus: new Date(),
    };

    const result = serializer.deserialize(serializer.serialize(payload));

    expect(result.foo).to.equals('bar');
    expect(result.jee).to.equals(42);
    expect(result.sus).to.be.an.instanceof(Date);
    expect(result.toto['lele.lolo.lulu'][0]).to.be.an.instanceof(ObjectID);
    expect(result.toto['lele.lolo.lulu'][1]).to.be.an.instanceof(ObjectID);
    expect(typeof result.jiz).to.equals('string');
  });
});
