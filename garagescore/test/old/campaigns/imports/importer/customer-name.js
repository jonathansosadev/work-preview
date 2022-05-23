const importName = require('../../../../../common/lib/garagescore/data-file/importer/customer-name');
const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('Import customer name from firstName/lastName/fullName:', () => {
  it('test import name - unknown firstName column', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Nom: 'ALEMANY Y BAUZA', Prenom: 'JEAN-PHILIPPE' };
    const options = { cellLabels: { lastName: 'Nom', firstName: 'xx' }, transformer: (c, v) => v };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).to.be.undefined;
      expect(dataRecord.importStats.dataValidity.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('');
      expect(dataRecord.customer.lastName).equal('Alemany Y Bauza');
      expect(dataRecord.customer.fullName).equal('Alemany Y Bauza');
      done();
    });
  });
  it('test import name - empty firstName column', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Nom: 'ALEMANY Y BAUZA' };
    const options = {
      cellLabels: { lastName: 'Nom', firstName: 'Prenom' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).to.be.undefined;
      expect(dataRecord.importStats.dataValidity.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('');
      expect(dataRecord.customer.lastName).equal('Alemany Y Bauza');
      expect(dataRecord.customer.fullName).equal('Alemany Y Bauza');
      done();
    });
  });

  it('test import name - unknown lastName column', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Nom: 'ALEMANY Y BAUZA', Prenom: 'JEAN-PHILIPPE' };
    const options = {
      cellLabels: { lastName: 'xx', firstName: 'Prenom' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.lastName).to.be.undefined;
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('Jean-Philippe');
      expect(dataRecord.customer.lastName).equal('');
      expect(dataRecord.customer.fullName).equal('Jean-Philippe');
      done();
    });
  });
  it('test import name - empty lastName column', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Prenom: 'JEAN-PHILIPPE' };
    const options = {
      cellLabels: { lastName: 'Nom', firstName: 'Prenom' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.lastName).to.be.undefined;
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('Jean-Philippe');
      expect(dataRecord.customer.lastName).equal('');
      expect(dataRecord.customer.fullName).equal('Jean-Philippe');
      done();
    });
  });

  it('test import name - empty firstName and lastName columns', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { fullName: 'JEAN-PHILIPPE ALEMANY Y BAUZA' };
    const options = {
      cellLabels: { lastName: 'Nom', firstName: 'Prenom', fullName: 'fullName' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).to.be.undefined;
      expect(dataRecord.importStats.dataValidity.customer.lastName).to.be.undefined;
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).to.be.undefined;
      expect(dataRecord.customer.lastName).to.be.undefined;
      expect(dataRecord.customer.fullName).equal('Jean-Philippe Alemany Y Bauza');
      done();
    });
  });

  it('test import name - 3 columns filled, full < first+last', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Nom: 'ALEMANY Y BAUZA', Prenom: 'JEAN-PHILIPPE', fullName: 'JEAN-PHILIPPE ALEMANY' };
    const options = {
      cellLabels: { lastName: 'Nom', firstName: 'Prenom', fullName: 'fullName' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('Jean-Philippe');
      expect(dataRecord.customer.lastName).equal('Alemany Y Bauza');
      expect(dataRecord.customer.fullName).equal('Jean-Philippe Alemany Y Bauza');
      done();
    });
  });

  it('test import name - 3 columns filled, full > first+last', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Nom: 'ALEMANY', Prenom: 'JEAN-PHILIPPE', fullName: 'JEAN-PHILIPPE ALEMANY Y BAUZA' };
    const options = {
      cellLabels: { lastName: 'Nom', firstName: 'Prenom', fullName: 'fullName' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('Jean-Philippe');
      expect(dataRecord.customer.lastName).equal('Alemany');
      expect(dataRecord.customer.fullName).equal('Jean-Philippe Alemany Y Bauza');
      done();
    });
  });

  it('test import name - 3 columns filled, full > first+last', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { Nom: 'ALEMANY', Prenom: 'JEAN-PHILIPPE', fullName: 'JEAN-PHILIPPE ALEMANY Y BAUZA' };
    const options = {
      cellLabels: { lastName: 'Nom', firstName: 'Prenom', fullName: 'fullName' },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('Jean-Philippe');
      expect(dataRecord.customer.lastName).equal('Alemany');
      expect(dataRecord.customer.fullName).equal('Jean-Philippe Alemany Y Bauza');
      done();
    });
  });

  it('test import 19/09', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = {
      'Civilité (Libellé)': 'Mme',
      'Nom individu': 'DERAINS',
      Prénom: 'LYNE',
      'Email individu': 'lyne.derains@wanadoo.fr',
    }; // eslint-disable-line max-len

    const options = {
      cellLabels: {
        fullName: ['Nom client', 'NOM DU CLIENT'],
        firstName: ['Prénom', 'Prénom (propriétaire)', 'PRENOM'],
        lastName: ['Nom', 'Nom individu', 'Nom (propriétaire)'],
      },
      transformer(c, v) {
        return v;
      },
    };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      expect(dataRecord.importStats.dataPresence.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.fullName).equal(true);

      expect(dataRecord.importStats.dataValidity.customer.firstName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.lastName).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.fullName).equal(true);

      expect(dataRecord.customer.firstName).equal('Lyne');
      expect(dataRecord.customer.lastName).equal('Derains');
      expect(dataRecord.customer.fullName).equal('Lyne Derains');
      done();
    });
  });
});
