const optionsParser = require('../../../../common/lib/garagescore/data-file/options-parser');
const chai = require('chai');

const expect = chai.expect;
chai.should();

/*
 * Test import filters syntax
 */

const _buildIgnore = function Ignore(filter, map) {
  const fcts = optionsParser.parseRowsFilter(filter, map);
  return (row) => {
    let k = false;
    fcts.forEach((f) => {
      if (!f(row)) {
        k = true;
      }
    });
    return k;
  };
};

describe('Filter evaluator:', () => {
  const row1 = {
    'Nom Affaire': 'GIDAATH',
    'No facture': '349865',
    'Type facture': 'FAC',
    'Libellé réceptionnaire': 'Nicolas MASSOZ',
  };
  const row2 = {
    'Nom Affaire': 'GIDAVI',
    'No facture': '489412',
    'Type facture': 'FAC',
    'Libellé réceptionnaire': 'Patrick LOPES',
  };
  const row3 = {
    'Nom Affaire': '  VNVOATH  ',
    'No facture': '354677',
    'Type facture': 'FAC',
    'Libellé réceptionnaire': 'Raul PERAL',
  };
  const row4 = {
    Type: 1,
    Nom: 'Henry',
    TypeActeRealise: 'Facture - Atelier',
    Etablissement: '96',
  };
  const row5 = {
    Type: 1,
    Nom: 'Erwan',
    TypeActeRealise: 'Devis - Atelier',
    Etablissement: '96',
  };
  const row6 = {
    Type: 1,
    Nom: 'Benoit',
    TypeActeRealise: 'Facture - Atelier',
    Etablissement: 1,
  };

  it('test case insensitive equal', (done) => {
    const ignore = _buildIgnore('["Nom Affaire"] != "GIDAATh"i && ["Nom Affaire"] != "VNVOATH"');
    expect(ignore(row1)).equal(true);
    expect(ignore(row2)).equal(false);
    expect(ignore(row3)).equal(true);
    expect(ignore(row4)).equal(false);
    expect(ignore(row5)).equal(false);
    expect(ignore(row6)).equal(false);
    done();
  });

  it('test insensitive columns mapping', (done) => {
    const ignore = _buildIgnore('{"email"} != "1" && {"name"} != "T"i', {
      email: ['em', 'x', 'mel'],
      name: ['toto', 'tutu'],
    });
    expect(ignore({ x: '1' })).equal(true);
    expect(ignore({ x: '2' })).equal(false);
    expect(ignore({ mel: '1' })).equal(true);
    expect(ignore({ toto: 't' })).equal(true);
    expect(ignore({ toto: 'r' })).equal(false);
    done();
  });

  it('test case insensitive different', (done) => {
    const ignore = _buildIgnore(
      '                 [   "Nom Affaire"     ] !=                    "giDAaTh"i              '
    );
    expect(ignore(row1)).equal(true);
    expect(ignore(row2)).equal(false);
    done();
  });

  it('test includes insensitive', (done) => {
    const ignore = _buildIgnore('!["x"].includes("A")i && !["y"].includes("B")i'); // eslint-disable-line
    expect(ignore({})).equal(false);
    expect(ignore({ x: 'aaaa' })).equal(true);
    expect(ignore({ x: 'b' })).equal(false);
    expect(ignore({ y: 'a' })).equal(false);
    expect(ignore({ y: 'b' })).equal(true);
    expect(ignore({ x: 'a', y: 'a' })).equal(true);
    expect(ignore({ x: 'b', y: 'b' })).equal(true);
    expect(ignore({ x: 'b', y: 'a' })).equal(false);
    done();
  });

  it('test insensitive mapping', (done) => {
    const ignore = _buildIgnore('!{"email"}.includes("A")i and ( !{"name"}.includes("B")i)', {
      email: ['em', 'x', 'mel'],
      name: ['toto', 'tutu'],
    });
    expect(ignore({ x: '1' })).equal(false);
    expect(ignore({ x: '2' })).equal(false);
    expect(ignore({ mel: 'Tat' })).equal(true);
    expect(ignore({ toto: 'taz' })).equal(false);
    expect(ignore({ tutu: 'rtb' })).equal(true);
    done();
  });

  it('test !in insensitive', (done) => {
    const ignore = _buildIgnore('![  "name"  ] in      ("ok" ) && (!["lastName"     ] in ("test", "lol", "ok"))');
    expect(ignore({ tata: 'ok', lastName: 'toto' })).equal(false);
    expect(ignore({ name: 'oK' })).equal(true);
    expect(ignore({ name: 'b' })).equal(false);
    expect(ignore({ lastName: 'a' })).equal(false);
    expect(ignore({ lastName: 'b' })).equal(false);
    expect(ignore({ name: 'a', lastName: 'tesT' })).equal(true);
    expect(ignore({ name: 'b', lastName: 'b' })).equal(false);
    expect(ignore({ name: 'b', lastName: 'LOL' })).equal(true);
    done();
  });

  it('test !in insensitive 2', (done) => {
    const ignore = _buildIgnore('!["x"] in ("test", "lol", "ok") && !["y"] in ("test", "lol", "ok")');
    expect(ignore({})).equal(false);
    expect(ignore({ x: 'oK', y: 'lol' })).equal(true);
    expect(ignore({ x: 'b' })).equal(false);
    done();
  });

  it('test !inc insensitive', (done) => {
    const ignore = _buildIgnore('!["x"] inc ("test", "lol", "ok") && !["y"] inc ("test", "lol", "ok")');
    expect(ignore({})).equal(false);
    expect(ignore({ x: 'oK', y: 'lol' })).equal(true);
    expect(ignore({ x: 'b' })).equal(false);
    expect(ignore({ x: 'ezjer test ze,jpozef', y: 'lo' })).equal(true);
    done();
  });

  it('test !in insensitive mapping', (done) => {
    const ignore = _buildIgnore('!{"email"} in ("A", "lol", "Z") && !{"name"} in ("A")', {
      email: ['em', 'x', 'mel'],
      name: ['toto', 'tutu'],
    });
    expect(ignore({ x: '1' })).equal(false);
    expect(ignore({ x: '2' })).equal(false);
    expect(ignore({ mel: 'lol' })).equal(true);
    expect(ignore({ toto: 'a' })).equal(true);
    expect(ignore({ em: 'z' })).equal(true);
    done();
  });

  it('test !inc insensitive mapping', (done) => {
    const ignore = _buildIgnore('!{"email"} inc ("A", "lol ", "Z") && !{"name"} inc ("A")', {
      email: ['em', 'x', 'mel'],
      name: ['toto', 'tutu'],
    });
    expect(ignore({ x: '1' })).equal(false);
    expect(ignore({ x: '2' })).equal(false);
    expect(ignore({ mel: 'rergerglol mmmmmmmmm' })).equal(true);
    expect(ignore({ toto: 'bistaux' })).equal(true);
    expect(ignore({ em: 'zaze' })).equal(true);
    done();
  });

  it('test !inc insensitive mapping 2 special char', (done) => {
    const ignore = _buildIgnore(
      '!{"lastName"} inc ("ARVAL ", "BANK", "LA POSTE", "PRÃ©PA, MÃ©CA .") && !{"name"} inc ("Au")',
      {
        lastName: ['last', 'name'],
        name: ['toto', 'tutu'],
      }
    );
    expect(ignore({ last: '1' })).equal(false);
    expect(ignore({ last: '2LA POST' })).equal(false);
    expect(ignore({ last: 'rergerbankglol mmmmmmmmm' })).equal(true);
    expect(ignore({ last: 'bistaux' })).equal(false);
    expect(ignore({ last: 'zaze', toto: 'heAUhe' })).equal(true);
    expect(ignore({ last: 'zaPRÃ©PA, MÃ©CA .zze' })).equal(true);
    done();
  });

  it('test inc insensitive', (done) => {
    const ignore = _buildIgnore('["lastName"] inc ("ARVAL ", "BANK", "LA POSTE", "PRÃ©PA, MÃ©CA .")');
    expect(ignore({ lastName: '1' })).equal(true);
    expect(ignore({ lastName: '2LA POST' })).equal(true);
    expect(ignore({ lastName: 'rergerbankglol mmmmmmmmm' })).equal(false);
    expect(ignore({ lastName: 'bistaux' })).equal(true);
    expect(ignore({ lastName: 'zaze', toto: 'heAUhe' })).equal(true);
    expect(ignore({ lastName: 'zaPRÃ©PA, MÃ©CA .zze' })).equal(false);
    done();
  });

  it('test in insensitive', (done) => {
    const ignore = _buildIgnore('["lastName"] in ("ARVAL d", "BANK", "LA POSTE")');
    expect(ignore({ lastName: '1' })).equal(true);
    expect(ignore({ lastName: '2LA POST' })).equal(true);
    expect(ignore({ lastName: 'rergerbankglol mmmmmmmmm' })).equal(true);
    expect(ignore({ lastName: 'bistaux' })).equal(true);
    expect(ignore({ lastName: 'ARVAL d', toto: 'heAUhe' })).equal(false);
    expect(ignore({ lastName: 'zaPRÃ©PA, MÃ©CA .zze' })).equal(true);
    done();
  });

  it('test inc insensitive mapping 3 + parenthesis', (done) => {
    const ignore = _buildIgnore(
      '!({"firstName"} inc ("ARVAL ", "BANK", "CIC", "LA POSTE", "Cession",' +
        ' "ATELIER", "OCCASION", "FLEET", "VN", "vnvo", "vovn", "vovp", "vpvo"))',
      { firstName: ['first', 'name'], name: ['toto', 'tutu'] }
    );
    expect(ignore({ first: '1' })).equal(false);
    expect(ignore({ first: '2LA POST' })).equal(false);
    expect(ignore({ first: 'rergerbankglol mmmmmmmmm' })).equal(true);
    expect(ignore({ first: 'bistaux' })).equal(false);
    expect(ignore({ first: 'zaze', toto: 'heAUhe' })).equal(false);
    expect(ignore({ first: 'zaPRÃ©PA, MÃArvAL ©CA .zze' })).equal(true);
    done();
  });

  it('test parse string 1 with spaces', (done) => {
    const ignore = _buildIgnore('["Nom Affaire"]!="GIDAATH"   and               (["Nom Affaire"] !="VNVOATH")');
    expect(ignore(row1)).equal(true);
    expect(ignore(row2)).equal(false);
    expect(ignore(row3)).equal(true);
    expect(ignore(row4)).equal(false);
    expect(ignore(row5)).equal(false);
    expect(ignore(row6)).equal(false);
    done();
  });

  it('test parse string with !=', (done) => {
    const ignore = _buildIgnore('["Etablissement"] != "96"');
    expect(ignore(row1)).equal(false);
    expect(ignore(row2)).equal(false);
    expect(ignore(row3)).equal(false);
    expect(ignore(row4)).equal(true);
    expect(ignore(row5)).equal(true);
    expect(ignore(row6)).equal(false);
    done();
  });

  it('test row modification 1', (done) => {
    const ignore = _buildIgnore('["x"] != "1"');
    const row = { x: 'x' };
    expect(row.x).equal('x');
    ignore(row);
    expect(row.x).equal('x');
    done();
  });

  it('test includes', (done) => {
    const ignore = _buildIgnore('(!["x"].includes("a")) && !["y"].includes("b")');
    expect(ignore({})).equal(false);
    expect(ignore({ x: 'a' })).equal(true);
    expect(ignore({ x: 'b' })).equal(false);
    expect(ignore({ y: 'a' })).equal(false);
    expect(ignore({ y: 'b' })).equal(true);
    expect(ignore({ x: 'a', y: 'a' })).equal(true);
    expect(ignore({ x: 'b', y: 'b' })).equal(true);
    expect(ignore({ x: 'b', y: 'a' })).equal(false);
    done();
  });

  it('test syntax error', (done) => {
    const ignore = _buildIgnore('["Etablissement"] != "1"and ["NumeroFacture"].includes("1F")');
    expect(ignore({})).equal(false);
    expect(ignore({ Etablissement: '1', NumeroFacture: '1F' })).equal(false);
    done();
  });

  it('test columns mapping and spaces', (done) => {
    const ignore = _buildIgnore('          {"email"}     !=               "1"', {
      email: ['em', 'x', 'mel'],
      toto: ['y'],
    });
    expect(ignore({ x: '1' })).equal(true);
    expect(ignore({ mel: '1' })).equal(true);
    expect(ignore({ x: '2' })).equal(false);
    done();
  });

  it('test columns mapping and spaces equal', (done) => {
    const ignore = _buildIgnore('          ["email"]     =               "1"', {
      email: ['em', 'x', 'mel'],
      toto: ['y'],
    });
    expect(ignore({ email: '1' })).equal(false);
    expect(ignore({ email: '1' })).equal(false);
    expect(ignore({ email: '2' })).equal(true);
    done();
  });

  it('test real one', (done) => {
    const ignore = _buildIgnore(
      '(["N° site"] = "1420" or ( ["N°module"] = "12" and  ["Kilometre reading"]*1 > 100 ))' +
        ' and (!["Name"].includes("ADVANCE")) and ["Name"] != "PLANET AUTO"' +
        ' and ["Name"] != "VOLKSWAGEN BANK S.A." and ["Name"] != "CPFi MINISTERE DE L\'INTERIEUR"' +
        ' and ["Name"] != "VOLKSWAGEN BANK S.A."  and ["Name"] != "Speed Pieces AUTO"' +
        ' and ["Name"] != "ALD AUTOMOTIVE"  and ["Name"] != "ARVAL SERVICE LEASE"' +
        ' and ["Name"] != "PC AUTO" and ["verknr"] != "014" and ["verknr"] != "389"' +
        ' and ["verknr"] != "301" and ["verknr"] != "302" and ["verknr"] != "013"'
    );
    expect(ignore({ 'N° site': '1420' })).equal(false);
    expect(ignore({ 'N°module': '12', 'Kilometre reading': '101' })).equal(false);
    expect(ignore({ 'N°module': 'd12', 'Kilometre reading': '4354' })).equal(true);
    expect(ignore({ email: '1' })).equal(true);
    expect(ignore({ email: '2' })).equal(true);
    done();
  });

  it('test parse string 2', (done) => {
    const ignore = _buildIgnore('(["TypeActeRealise"] = "Facture - Atelier"i || ["Etablissement"]*1    >    95)');
    expect(ignore(row1)).equal(true);
    expect(ignore(row2)).equal(true);
    expect(ignore(row3)).equal(true);
    expect(ignore(row4)).equal(false);
    expect(ignore(row5)).equal(false);
    expect(ignore(row6)).equal(false);
    done();
  });

  it('test empty string', (done) => {
    const ignore = _buildIgnore(
      '(["Nom Affaire"] = "GIDAB" or (["Compte Affaire"] = "VNVOB" and ["Site (Lib)"] = "BOURG"))' +
        ' and ["Nom individu"] != "" and !["Nom"] in ("testeuh", "test") && ["Nom Affaire"] = "GIDAB"',
      { email: ['em', 'x', 'mel'], name: ['toto', 'tutu'] }
    );
    expect(ignore({ 'Nom individu': 'THIBAULT', 'Nom Affaire': 'GIDAB', Nom: 'tes' })).equal(false);
    expect(ignore({ x: '2' })).equal(true);
    expect(ignore({ mel: '1' })).equal(true);
    done();
  });

  it('test empty string in inc', (done) => {
    const ignore = _buildIgnore('!["Nom individu"] in ("d") and !["Nom individu"] inc ("do")', {
      email: ['em', 'x', 'mel'],
      name: ['toto', 'tutu'],
    });
    expect(ignore({ 'Nom individu': 'aaaadaaa', 'Nom Affaire': 'GIDAV', Nom: 'test' })).equal(false);
    expect(ignore({ x: '2' })).equal(false);
    expect(ignore({ mel: '1' })).equal(false);
    done();
  });

  it('test empty string 2', (done) => {
    const ignore = _buildIgnore('({"Nom individu"} != "") and (!["Nom individu"] inc ("s", "test", "lol"))', {
      'Nom individu': ['em', 'x', 'mel'],
      name: ['toto', 'tutu'],
    });
    expect(ignore({ 'Nom individu': 'hgd', 'Nom Affaire': 'GIDAV', Nom: 'test' })).equal(false);
    expect(ignore({ x: '2' })).equal(false);
    expect(ignore({ mel: '1' })).equal(false);
    done();
  });

  it('cleanSpacesExceptBetweenQuotes 1', (done) => {
    const s = 'a  b';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal('a b');
    done();
  });
  it('cleanSpacesExceptBetweenQuotes 2', (done) => {
    const s = 'a "c"  b';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal('a "c" b');
    done();
  });
  it('cleanSpacesExceptBetweenQuotes 3', (done) => {
    const s = 'a  "c d"  b';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal('a "c d" b');
    done();
  });
  it('cleanSpacesExceptBetweenQuotes 4', (done) => {
    const s = 'a  "c  d"  b';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal('a "c  d" b');
    done();
  });
  it('cleanSpacesExceptBetweenQuotes 5', (done) => {
    const s = 'a  "c  d"    "e" b';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal('a "c  d" "e" b');
    done();
  });
  it('cleanSpacesExceptBetweenQuotes 6', (done) => {
    const s = 'a  "c  d"    "e    f   g" b';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal('a "c  d" "e    f   g" b');
    done();
  });
  it('cleanSpacesExceptBetweenQuotes A', (done) => {
    const s = '["providedGarageId"] = "10" or ["providedGarageId"] = "12" or ["providedGarageId"] = "PV  VP MONTAUBAN"';
    expect(optionsParser.cleanSpacesExceptBetweenQuotes(s)).equal(
      '["providedGarageId"] = "10" or ["providedGarageId"] = "12" or ["providedGarageId"] = "PV  VP MONTAUBAN"'
    );
    done();
  });

  it('FIXAOUT2018', (done) => {
    const mapping = { firstName: ['PRENOM', 'Prénom'], lastName: ['Nom', 'N2Famille'] };
    const ignore = _buildIgnore('FIXAOUT2018', mapping);
    expect(ignore({ Prénom: 'A ne pas ignorer', N2Famille: '', 'No facture': '349865' })).equal(false);
    expect(ignore({ Nom: 'A ne pas ignorer', PRENOM: '', 'No facture': '349865' })).equal(false);
    expect(ignore({ Prénom: '', N2Famille: '', 'No facture': '349865' })).equal(true);
    expect(ignore({ Prénom: 'A ignorer', N2Famille: 'A ignorer', 'No facture': '349865' })).equal(true);
    expect(ignore({ Prénom: '', 'No facture': '349865' })).equal(true);
    expect(ignore({ N2Famille: '', 'No facture': '349865' })).equal(true);
    expect(ignore({ 'No facture': '349865' })).equal(true);
    done();
  });
});
