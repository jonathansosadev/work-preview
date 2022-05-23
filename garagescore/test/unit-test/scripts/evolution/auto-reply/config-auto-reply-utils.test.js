const TestApp = require('../../../../../common/lib/test/test-app');
const chai = require('chai');

// import the script functions here
const { configCsv2json } = require('../../../../../scripts/evolution/auto-reply/config-auto-reply-utils');
const SourceTypes = require('../../../../../common/models/data/type/source-types');

const expect = chai.expect;
const app = new TestApp();

/**
 * Tests templating !
 */
describe('Automatic reply to reviews config script', () => {
  let garages = [];
  before(async () => {
    await app.reset();
    // Create 10 garages
    for (let i = 0; i < 10; i++) {
      const createdGarage = await app.addGarage();
      garages.push(createdGarage);
    }
  });

  describe('Translating the CSV to JSON', () => {
    it('returns a JSON', async () => {
      const csv = '';
      const json = configCsv2json(csv);
      expect(json).to.be.an('object');
    });

    it('returns an object with garageIds as keys', () => {
      const csv = `
        Etablissement;Nom garage;Source;Catégorie satisfaction;Texte automatique
        ${garages.map(({ id }) => `${id.toString()};Garage Dupont;DataFile;promoteur;default`).join('\n')}
      `.trim();

      const json = configCsv2json(csv);
      expect(json).to.have.all.keys(garages.map(({ id }) => id.toString()));
    });

    it("won't take empty/invalid configs into consideration", () => {
      const csv = `
        Etablissement;Nom garage;Source;Catégorie satisfaction;Texte automatique
        ${garages[0].id.toString()};Garage Dupont;DataFile;promoteur;Merci
        ${garages[1].id.toString()};Garage Dupont;DataFile;passif;Hmmm...
        ${garages[2].id.toString()};Garage Dupont;DataFile;détracteur;Grrrr...
        ${garages[3].id.toString()};Garage Dupont;DataFile;no exists;Hein?
        ${garages[4].id.toString()};Garage Dupont;DataFile;promoteur;
        ${garages[5].id.toString()};Garage Dupont;DataFile;;empty category
        ${garages[6].id.toString()};Garage Dupont;DataFile;;
        ${garages[7].id.toString()};Garage Dupont;no exists;promoteur;What?
        ${garages[8].id.toString()};;;promoteur;No source
        ${garages[9].id.toString()};;;;
        PLOP;Garage Dupont;DataFile;promoteur;Merci
      `.trim();

      const json = configCsv2json(csv);
      expect(json).to.have.all.keys(garages.slice(0, 3).map(({ id }) => id.toString()));
    });

    it('returns an object containing the configs per category for each garage', () => {
      const havePromotor = garages.slice(0, 7);
      const haveNeutral = garages.slice(2, 9);
      const haveDetractor = garages.slice(4);
      const csv = `
        Etablissement;Nom garage;Source;Catégorie satisfaction;Texte automatique
        ${havePromotor.map(({ id }) => `${id.toString()};Grage Dupont;DataFile;promoteur;such wow`).join('\n')}
        ${haveNeutral.map(({ id }) => `${id.toString()};Garage Dupont;DataFile;passif;hmmmm....`).join('\n')}
        ${haveDetractor.map(({ id }) => `${id.toString()};Garage Dupont;DataFile;détracteur;ay caramba !`).join('\n')}
      `.trim();

      const json = configCsv2json(csv);
      expect(json).to.have.all.keys(garages.map(({ id }) => id.toString()));
      for (const garage of havePromotor) {
        const { DataFile } = json[garage.id.toString()];
        expect(DataFile, garage.id.toString()).to.be.an('object').and.to.have.any.key('promotor');
        expect(DataFile.promotor).to.be.an('array').and.to.have.lengthOf(1).and.to.include('such wow');
      }
      for (const garage of haveNeutral) {
        const { DataFile } = json[garage.id.toString()];
        expect(DataFile).to.be.an('object').and.to.have.any.key('neutral');
        expect(DataFile.neutral).to.be.an('array').and.to.have.lengthOf(1).and.to.include('hmmmm....');
      }
      for (const garage of haveDetractor) {
        const { DataFile } = json[garage.id.toString()];
        expect(DataFile).to.be.an('object').and.to.have.any.key('detractor');
        expect(DataFile.detractor).to.be.an('array').and.to.have.lengthOf(1).and.to.include('ay caramba !');
      }
    });

    it('supports sources that have "automaticRepliesSupported" flag in sourceTypes.json', () => {
      const garageId = garages[0].id.toString();
      const csv = `
        Etablissement;Nom garage;Source;Catégorie satisfaction;Texte automatique
        ${garageId};Garage Dupont;${SourceTypes.DATAFILE};promoteur;text datafile
        ${garageId};Garage Dupont;${SourceTypes.GOOGLE};promoteur;text google
        ${garageId};Garage Dupont;${SourceTypes.FACEBOOK};promoteur;text facebook
        ${garageId};Garage Dupont;${SourceTypes.MANUAL_LEAD};promoteur;text manual lead
        ${garageId};Garage Dupont;PLOP;promoteur;text plop
      `.trim();

      const json = configCsv2json(csv);
      expect(json).to.have.all.keys([garageId]);
      const configBySource = json[garageId];
      expect(configBySource).to.have.all.keys([SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.FACEBOOK]);
      expect(Object.keys(configBySource)).to.have.lengthOf(3);
    });

    it('we can have several texts for 1 garage / source / rating condition', () => {
      const replies = ['Merci', 'Merci beaucoup', 'ça me touche, vraiment', 'ça fait plaisir !'];
      const csv = `
        Etablissement;Nom garage;Source;Catégorie satisfaction;Texte automatique
        ${replies.map((reply) => `${garages[0].id.toString()};Garage Dupont;DataFile;promoteur;${reply}`).join('\n')}
      `.trim();

      const json = configCsv2json(csv);

      const { DataFile } = json[garages[0].id.toString()];
      expect(DataFile.promotor).to.be.an('array').and.to.have.lengthOf(replies.length).and.to.have.all.members(replies);
    });

    it('duplicates in the CSV are not duplicated in the JSON', () => {
      const replies = Array.from(Array(10)).map(() => 'Duplicate');
      const csv = `
        Etablissement;Nom garage;Source;Catégorie satisfaction;Texte automatique
        ${replies.map((reply) => `${garages[0].id.toString()};Garage Dupont;DataFile;promoteur;${reply}`).join('\n')}
      `.trim();

      const json = configCsv2json(csv);

      const { DataFile } = json[garages[0].id.toString()];
      expect(DataFile.promotor).to.be.an('array').and.to.have.lengthOf(1).and.to.include(replies[0]);
    });
  });

  describe('We will be using garage-methods::activateAutomaticReplies, already tested, no need to test again', () => {});
});
