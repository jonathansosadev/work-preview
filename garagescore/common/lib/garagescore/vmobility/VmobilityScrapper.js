const puppeteer = require('puppeteer');
const moment = require('moment');
const debug = require('debug')('VmobilityScrapper');

/**
 * This class allows you to easily scrap VMobility data
 * You only need to prorvide the username the password and the date
 * Example of usage :
 * >> const vmobilityScrapper = new VmobilityScrapper('APV', 'myUsername', 'myPassword', '10/29/2018');
 * >> const result = await vmobilityScrapper.run();
 * The returned result will be a string formatted as CSV
 * If there is no entry the result string will be empty without any CSV header
 * @class
 */
class VmobilityScrapper {
  ///////////////////////////////////////
  //                                   //
  //           PUBLIC METHODS          //
  //                                   //
  ///////////////////////////////////////

  constructor(garageId, mode, username, password, date = null, takeSnapshots = false, dateStop = null) {
    this._$urls = {
      apv: 'https://saas.v-mobility.fr/imarketing/',
      vn: 'https://saas.v-mobility.fr/ivn/',
      vo: 'https://saas.v-mobility.fr/ivo/',
    };
    this._$garageId = garageId; // debug purposes
    this._$mode = mode.toLowerCase();
    this._$username = username;
    this._$password = password;
    this._$rawDate = date;
    this._$date = date ? moment(new Date(date)).format('DD/MM/YYYY') : moment().subtract(1, 'day').format('DD/MM/YYYY');
    this._$dateStop = dateStop ? moment(new Date(dateStop)).format('DD/MM/YYYY') : null;
    this._$instance = null;
    this._$page = null;
    this._$takeSnapshots = takeSnapshots;
    this._$error = false;
    this._$nbOfLoginTry = 5;
    this._$nbOfLoginCheck = 5;
    this._$nbOfRequestTry = 5;
    this._$mainPage = null;
    if (!this._$username || !this._$password || !this._$date || !this._$mode) {
      debug(`[VMobility] Instance ERROR.`);
      this._$error = true;
    } else {
      debug(
        `[VMobility] Instance created. Mode : ${mode.toUpperCase()}, User : ${username}, Date (FR) : ${this._$date}`
      );
    }
  }

  async run() {
    try {
      if (this._$error) {
        debug(`[VMobility] Instance Was ERROR. Returning Without Scrapping.`);
        return '';
      }
      this._$instance = await puppeteer.launch({ args: ['--no-sandbox'] });
      this._$mainPage = await this._$instance.newPage();
      this._$page = this._$mainPage.mainFrame();
      const open = await this._$page.goto(this._$urls[this._$mode]);
      if (open.status() !== 200) {
        this._$instance.exit(1);
        this._printMessage('FATAL ERROR : Unable to open page');
        return '';
      }
      this._printMessage(`Page successfully opened with url ${this._$urls[this._$mode]}`);
      return await this._process();
    } catch (e) {
      this._printMessage(e, true);
      return '';
    }
  }

  ///////////////////////////////////////
  //                                   //
  //          PRIVATE METHODS          //
  //                                   //
  ///////////////////////////////////////

  async _process() {
    let result = '';
    await this._evaluate('0. Start Processing', '0-start');
    if (!(await this._loginLoop())) {
      await this._close();
      return '';
    }
    await this._switchFrame('fright', 'fleft');
    // catchup from dateX to dateY
    if (this._$dateStop) {
      await this._evaluate(
        '2. Select Search Criteria',
        '2-search-criteria',
        2,
        this.__selectSearchCriteriaCatchup,
        this._$mode,
        this._$date,
        this._$dateStop
      );
    } else {
      await this._evaluate(
        '2. Select Search Criteria',
        '2-search-criteria',
        2,
        this.__selectSearchCriteria,
        this._$mode,
        this._$date,
        this._$dateStop
      );
    }

    await this._switchFrame();
    await this._evaluate('3. Switch To Fields Menu', '3-fields-menu', 10, this.__switchToFieldsMenu, this._$mode);
    await this._switchFrame('fright', 'treeviewSelection');
    await this._evaluate('4. Select Fields', '4-select-fields', 2, this.__selectFields, this._$mode);
    await this._switchFrame('fright');
    await this._evaluate('5. Validate Selected Fields', '5-validate-fields', 5, this.__validateSelectedFields);
    await this._switchFrame('fright', 'fleft');
    await this._evaluate('6. Start Request', '6-start-request', 10, this.__startRequest);
    await this._switchFrame('fright', 'fresult');
    while (
      !(await this._evaluate(
        `6. (Bis) Request Verification, ${--this._$nbOfRequestTry} Try Remaining`,
        null,
        10,
        this.__verifyRequestIsDone
      )) &&
      this._$nbOfRequestTry
    );
    result = await this._evaluate('7. Scrap Result', '7-scrap-result', 2, this.__scrapIt);
    await this._close();
    if (!result) {
      this._printMessage('9. Filtering / Cleaning - WARNING : Nothing To Clean, 0 Entries');
    }
    return result ? this._filterResult(result) : result;
  }

  async _loginLoop() {
    do {
      if (!this._$nbOfLoginTry) {
        this._printMessage('1. ERROR! Unable To Login!');
        return false;
      }
      --this._$nbOfLoginTry;
      await this._switchFrame();
      await this._evaluate(
        `1. Login, ${this._$nbOfLoginTry} Try Remaining`,
        '1-logged-in',
        10,
        this.__login,
        this._$username,
        this._$password
      );
      this._$nbOfLoginCheck = 5;
    } while (!(await this._loginVerificationLoop()));
    this._printMessage('1. Login Success!');
    return true;
  }

  async _loginVerificationLoop() {
    do {
      if (!this._$nbOfLoginCheck) {
        return false;
      }
      --this._$nbOfLoginCheck;
      await this._switchFrame('fright', 'fleft');
    } while (
      !(await this._evaluate(
        `1. (Bis) Login Verification, ${this._$nbOfLoginCheck} Try Remaining`,
        null,
        10,
        this.__checkLogin,
        this._$mode
      ))
    );
    return true;
  }

  _filterResult(rawResult) {
    const rows = rawResult.split('\n').filter((s) => s && s.length);
    const validRows = [rows[0]];
    const billingDateHeader = { apv: 'date de facture', vn: 'date fact.', vo: 'date facture' }[this._$mode];
    const billingDateCellIndex = rows[0] ? rows[0].toLowerCase().split(';').indexOf(billingDateHeader) : -1;

    if (billingDateCellIndex === -1) {
      this._printMessage(
        "9. Filtering / Cleaning - ERROR : 'Date de Facture' Not Found In CSV Header! Unable To Filter!"
      );
      return '';
    } else if (rows.length <= 1) {
      this._printMessage('9. Filtering / Cleaning - ERROR : No Entries! Just A CSV Header!');
      return '';
    }
    for (let i = 1; i < rows.length; ++i) {
      const billingDate = rows[i].split(';')[billingDateCellIndex] || '';
      const englishBillingDate = `${billingDate.split('/')[1]}/${billingDate.split('/')[0]}/${
        billingDate.split('/')[2]
      }`;
      if (
        billingDate &&
        (billingDate === this._$date || moment(new Date(englishBillingDate)).isSame(this._$rawDate, 'day'))
      ) {
        validRows.push(rows[i]);
      } else if (this._$dateStop) {
        validRows.push(rows[i]); // keep all date for catchup
      }
    }
    if (rows.length > validRows.length) {
      this._printMessage(
        `9. Filtering / Cleaning - WARNING : Had To Delete ${rows.length - validRows.length} Entries Out Of ${
          rows.length - 1
        }!`
      );
      if (validRows.length <= 1) {
        this._printMessage('9. Filtering / Cleaning - ERROR : No Entries After Cleaning! Just A CSV Header!');
        return '';
      }
    } else {
      this._printMessage(`9. Filtering / Cleaning - Ok : No Row Deleted (${rows.length - 1} Entries Total)`);
    }
    return `${validRows.join('\n')}\n`;
  }

  async _close() {
    this._printMessage('8. Closing Connection');
    await this._snapshot('8-closing-connection');
    this._$instance.close();
  }

  _printMessage(msg, isError = false) {
    if (isError) {
      console.error('FATAL ERROR IN VMOBILITY');
      console.error(msg);
    } else {
      debug(`[VMobility] (${this._$mode.toUpperCase()}, ${this._$username}, ${this._$date}) ${msg}`);
    }
  }

  async _snapshot(title) {
    if (this._$takeSnapshots && title) {
      const fileName = `vmobilitySnapshots/vmobility_snapshot_${this._$garageId}_${this._$mode}_${title}.png`;
      await this._$mainPage.screenshot({ path: fileName });
    }
  }

  async _switchFrame(...frames) {
    this._$page = this._$mainPage;
    for (const frame of frames) {
      this._$page = this._$mainPage.frames().find((_frame) => _frame.name() === frame);
    }
  }

  async _evaluate(msg, snap, sleepTime, func, ...funcArgs) {
    let result = null;
    let code = '';
    this._printMessage(msg);
    if (func) {
      code = func.toString().replace(func.name, ''); // A little lesson in trickery ;)
      code = code.substr(code.indexOf('{') + 1, code.length - (code.indexOf('{') + 2)).trim();
      result = await this._$page.evaluate(new Function(code), ...funcArgs);
    }
    await this._sleep(sleepTime || 0);
    await this._snapshot(snap);
    return result;
  }

  async _sleep(seconds) {
    return new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000));
  }

  ///////////////////////////////////////
  //                                   //
  //         SCRAPPING METHODS         //
  //  THOSE FUNCTION ARE EXECUTED BY   //
  //   PUPPETEER INNER ENGINE AND NOT  //
  //     BY NODE. SEE PUPPETEER DOC    //
  //                                   //
  ///////////////////////////////////////

  __login() {
    if (document.getElementById('user') && document.getElementById('pwd')) {
      document.getElementById('user').value = arguments[0]; // Fill input with login
      document.getElementById('pwd').value = arguments[1]; // Fill input with password
      document.getElementsByClassName('mob-button')[0].click(); // Simulate click on login button
    }
  }

  __checkLogin() {
    if (arguments[0] === 'apv') {
      return !!document.getElementsByName('NODZXXZFACTURATION')[0]; // Check if billing criteria exists
    } else if (arguments[0] === 'vn') {
      return !!document.getElementsByName('NODZXXZDOCS_VN')[0]; // Check if command criteria exists
    } else if (arguments[0] === 'vo') {
      return !!document.getElementsByName('NODZXXZCOMMANDES')[0]; // Check if command criteria exists
    }
  }

  __selectSearchCriteria() {
    if (arguments[0] === 'apv') {
      document.getElementsByName('NODZXXZFACTURATION')[0].click(); // Select billing criteria
      document.getElementsByName('NODZXXZFACTURATIONZXXZFACT_DATE')[0].click(); // Select billing date criteria
      document.getElementsByName('IMGZXXZFACTURATIONZXXZFACT_DATEZXXZe')[0].parentElement.click(); // Select billing date equal criteria
      document.getElementById('TXTZXXZFACTURATIONZXXZFACT_DATEZXXZeZXXZ0').value = arguments[1]; // Fill with yesterday date
    } else if (arguments[0] === 'vn') {
      document.getElementsByName('NODZXXZDOCS_VN')[0].click(); // Select command criteria
      document.getElementsByName('NODZXXZDOCS_VNZXXZDT_FACT')[0].click(); // Select billing date criteria
      document.getElementsByName('IMGZXXZDOCS_VNZXXZDT_FACTZXXZe')[0].parentElement.click(); // Select billing date equal criteria
      document.getElementById('TXTZXXZDOCS_VNZXXZDT_FACTZXXZeZXXZ0').value = arguments[1]; // Fill with yesterday date
    } else if (arguments[0] === 'vo') {
      document.getElementsByName('NODZXXZCOMMANDES')[0].click(); // Select command criteria
      document.getElementsByName('NODZXXZCOMMANDESZXXZDATEFACTURE')[0].click(); // Select billing date criteria
      document.getElementsByName('IMGZXXZCOMMANDESZXXZDATEFACTUREZXXZe')[0].parentElement.click(); // Select billing date equal criteria
      document.getElementById('TXTZXXZCOMMANDESZXXZDATEFACTUREZXXZeZXXZ0').value = arguments[1]; // Fill with yesterday date
    }
  }

  __selectSearchCriteriaCatchup() {
    if (arguments[0] === 'apv') {
      document.getElementsByName('NODZXXZFACTURATION')[0].click(); // Select billing criteria
      document.getElementsByName('NODZXXZFACTURATIONZXXZFACT_DATE')[0].click(); // Select billing date criteria
      document.getElementsByName('IMGZXXZFACTURATIONZXXZFACT_DATEZXXZsZXXZV')[0].parentElement.click(); // Select billing date >= criteria
      document.getElementById('TXTZXXZFACTURATIONZXXZFACT_DATEZXXZsZXXZ0').value = arguments[1]; // Fill with yesterday date
      document.getElementsByName('IMGZXXZFACTURATIONZXXZFACT_DATEZXXZiZXXZV')[0].parentElement.click(); // Select billing date <= criteria
      document.getElementById('TXTZXXZFACTURATIONZXXZFACT_DATEZXXZiZXXZ0').value = arguments[2]; // Fill with yesterday date
    } else if (arguments[0] === 'vn') {
      document.getElementsByName('NODZXXZDOCS_VN')[0].click(); // Select command criteria
      document.getElementsByName('NODZXXZDOCS_VNZXXZDT_FACT')[0].click(); // Select billing date criteria
      document.getElementsByName('IMGZXXZDOCS_VNZXXZDT_FACTZXXZs')[0].parentElement.click(); // Select billing date >= criteria
      document.getElementById('TXTZXXZDOCS_VNZXXZDT_FACTZXXZsZXXZ0').value = arguments[1]; // Fill with yesterday date
      document.getElementsByName('IMGZXXZDOCS_VNZXXZDT_FACTZXXZiZXXZV')[0].parentElement.click(); // Select billing date <= criteria
      document.getElementById('TXTZXXZDOCS_VNZXXZDT_FACTZXXZiZXXZ0').value = arguments[2]; // Fill with yesterday date
    } else if (arguments[0] === 'vo') {
      document.getElementsByName('NODZXXZCOMMANDES')[0].click(); // Select command criteria
      document.getElementsByName('NODZXXZCOMMANDESZXXZDATEFACTURE')[0].click(); // Select billing date criteria
      document.getElementsByName('IMGZXXZCOMMANDESZXXZDATEFACTUREZXXZs')[0].parentElement.click(); // Select billing date >= criteria
      document.getElementById('TXTZXXZCOMMANDESZXXZDATEFACTUREZXXZsZXXZ0').value = arguments[1]; // Fill with yesterday date
      document.getElementsByName('IMGZXXZCOMMANDESZXXZDATEFACTUREZXXZe')[0].parentElement.click(); // Select billing date <= criteria
      document.getElementById('TXTZXXZCOMMANDESZXXZDATEFACTUREZXXZiZXXZ0').value = arguments[1]; // Fill with yesterday date
    }
  }

  __switchToFieldsMenu() {
    if (arguments[0] === 'apv') {
      document.querySelector('li[data-node-id="104104"]').firstChild.click();
    } else if (arguments[0] === 'vn') {
      document.querySelector('li[data-node-id="106104"]').firstChild.click();
    } else if (arguments[0] === 'vo') {
      document.querySelector('li[data-node-id="107104"]').firstChild.click();
    }
  }

  __selectFields() {
    if (arguments[0] === 'apv') {
      document.getElementById('IMGZXXZCLIENTZXXZCODE').getParent().click(); // Client id
      document.getElementById('IMGZXXZCLIENTZXXZCIVILITE').getParent().click(); // Client gender
      document.getElementById('IMGZXXZCLIENTZXXZNOM').getParent().click(); // Client last name
      document.getElementById('IMGZXXZCLIENTZXXZPRENOM').getParent().click(); // Client first name
      document.getElementById('IMGZXXZCLIENTZXXZTYPE_TIERS').getParent().click(); // Client type
      document.getElementById('IMGZXXZCOMPTEZXXZCLT_COMPTE').getParent().click(); // Client account
      document.getElementById('IMGZXXZADRESSEZXXZADRESSE').getParent().click(); // Client address
      document.getElementById('IMGZXXZADRESSEZXXZADRESSESUITE').getParent().click(); // Client address 2
      document.getElementById('IMGZXXZADRESSEZXXZCODE_POSTAL').getParent().click(); // Client postal code
      document.getElementById('IMGZXXZADRESSEZXXZVILLE').getParent().click(); // Client city
      document.getElementById('IMGZXXZADRESSEZXXZTELEPHONE_PERS').getParent().click(); // Client phone
      document.getElementById('IMGZXXZADRESSEZXXZTELEPHONE_PORT').getParent().click(); // Client mobile phone
      document.getElementById('IMGZXXZADRESSEZXXZTELEPHONE_PROF').getParent().click(); // Client professional phone
      document.getElementById('IMGZXXZADRESSEZXXZEMAIL').getParent().click(); // Client email
      document.getElementById('IMGZXXZADRESSEZXXZTELPROFCNIL').getParent().click(); // Client refuse contact professional phone
      document.getElementById('IMGZXXZADRESSEZXXZTELDOMCNIL').getParent().click(); // Client refuse contact phone
      document.getElementById('IMGZXXZADRESSEZXXZTELPORTCNIL').getParent().click(); // Client refuse contact mobile phone
      document.getElementById('IMGZXXZADRESSEZXXZEMAILCNIL').getParent().click(); // Client refuse contact email

      document.getElementById('IMGZXXZVEHICULEZXXZIMMAT').getParent().click(); // Car registration number
      document.getElementById('IMGZXXZVEHICULEZXXZMARQUE').getParent().click(); // Car make
      document.getElementById('IMGZXXZVEHICULEZXXZMODELE').getParent().click(); // Car model
      document.getElementById('IMGZXXZVEHICULEZXXZKM').getParent().click(); // Car mileage
      document.getElementById('IMGZXXZVEHICULEZXXZGENRE').getParent().click(); // Car type
      document.getElementById('IMGZXXZVEHICULEZXXZDATEMEC').getParent().click(); // Car date

      document.getElementById('IMGZXXZFACTURATIONZXXZFACT_NUM').getParent().click(); // Billing id
      document.getElementById('IMGZXXZFACTURATIONZXXZFACT_DATE').getParent().click(); // Billing date
      document.getElementById('IMGZXXZFACTURATIONZXXZFACT_NATURE').getParent().click(); // Billing nature
      document.getElementById('IMGZXXZFACTURATIONZXXZFACT_ACTIVITE').getParent().click(); // Billing activity
      document.getElementById('IMGZXXZFACTURATIONZXXZFACT_TYP_DOC').getParent().click(); // Billing document type
      document.getElementById('IMGZXXZFACTURATIONZXXZFACT_NATURE_LIEU').getParent().click(); // #3335 Lieu facture
    } else if (arguments[0] === 'vn') {
      document.getElementById('IMGZXXZVEHICULESZXXZMARQUE').getParent().click(); // Car make
      document.getElementById('IMGZXXZVEHICULESZXXZMODELE').getParent().click(); // car model
      document.getElementById('IMGZXXZVEHICULESZXXZDAT_MEC').getParent().click(); // Car date
      document.getElementById('IMGZXXZVEHICULESZXXZNO_IMMATZXXZV').getParent().click(); // Car registration number

      document.getElementById('IMGZXXZDOCS_VNZXXZNUM_FACT').getParent().click(); // Billing id
      document.getElementById('IMGZXXZDOCS_VNZXXZDT_FACT').getParent().click(); // Billing date
      document.getElementById('IMGZXXZDOCS_VNZXXZDT_LIV_PREV').getParent().click(); // Delivery date
      document.getElementById('IMGZXXZVNZXXZLIEU').getParent().click(); // #3335 Lieu facture

      document.getElementById('IMGZXXZCLIENTZXXZNUM_CLIENT').getParent().click(); // Client ID
      document.getElementById('IMGZXXZCLIENTZXXZTYPE_CLIENT').getParent().click(); // Client type
      document.getElementById('IMGZXXZCLIENTZXXZCIVILITE').getParent().click(); // Client gender
      document.getElementById('IMGZXXZCLIENTZXXZNOM').getParent().click(); // Client last name
      document.getElementById('IMGZXXZCLIENTZXXZPRENOM').getParent().click(); // Client first name or SIRET
      document.getElementById('IMGZXXZCLIENTZXXZADRESSE').getParent().click(); // Client address
      document.getElementById('IMGZXXZCLIENTZXXZADRESSE_SUITE').getParent().click(); // Client address 2
      document.getElementById('IMGZXXZCLIENTZXXZCODE_POSTAL').getParent().click(); // Client postal code
      document.getElementById('IMGZXXZCLIENTZXXZVILLE').getParent().click(); // Client city
      document.getElementById('IMGZXXZCLIENTZXXZTEL_DOM').getParent().click(); // Client home phone
      document.getElementById('IMGZXXZCLIENTZXXZTEL_PROF').getParent().click(); // Client pro phone
      document.getElementById('IMGZXXZCLIENTZXXZTEL_PORT').getParent().click(); // Client perso phone
      document.getElementById('IMGZXXZCLIENTZXXZEMAIL').getParent().click(); // Client email
      document.getElementById('IMGZXXZCLIENTZXXZSTOPMAILING').getParent().click(); // Client stop email
      document.getElementById('IMGZXXZVENDEUR_CMDEZXXZNOM_VENDEUR').getParent().click(); // Salesman name
    } else if (arguments[0] === 'vo') {
      document.getElementById('IMGZXXZVOZXXZIMMAT').getParent().click(); // Car registration
      document.getElementById('IMGZXXZVOZXXZVDZXXZV').getParent().click(); // Car VD

      document.getElementById('IMGZXXZVEHICULESZXXZMARQUE').getParent().click(); // Car make
      document.getElementById('IMGZXXZVEHICULESZXXZMODELEZXXZV').getParent().click(); // Car model
      document.getElementById('IMGZXXZVEHICULESZXXZDATEMECZXXZV').getParent().click(); // Car date

      document.getElementById('IMGZXXZCOMMANDESZXXZNUMEROFACTURE').getParent().click(); // Billing id
      document.getElementById('IMGZXXZCOMMANDESZXXZDATELIVRAISON').getParent().click(); // Delivery date
      document.getElementById('IMGZXXZCOMMANDESZXXZDATEFACTURE').getParent().click(); // Billing date
      document.getElementById('IMGZXXZCOMMANDESZXXZCOMMANDEVENDEURZXXZV').getParent().click(); // Salesman name
      document.getElementById('IMGZXXZVOZXXZLIEU').getParent().click(); // #3335 Lieu facture
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZNUMCLIENTACHETEURZXXZV').getParent().click(); // Client id
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZCIVILITEACHETEURZXXZV').getParent().click(); // Client gender
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZNOMACHETEURZXXZV').getParent().click(); // Client last name
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZPRENOMACHETEURZXXZV').getParent().click(); // Client first name
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZADRESSEACHETEURZXXZV').getParent().click(); // Client address
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZADRESSESUITEACHETEURZXXZV').getParent().click(); // Client address 2
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZCODEPOSTALACHETEURZXXZV').getParent().click(); // Client postal code
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZVILLEACHETEURZXXZV').getParent().click(); // Client city
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZTELPERSOACHETEURZXXZV').getParent().click(); // Client home phone
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZTELPROFACHETEURZXXZV').getParent().click(); // Client pro phone
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZTELPORTACHETEURZXXZV').getParent().click(); // Client perso phone
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZEMAILACHETEURZXXZV').getParent().click(); // Client email
      document.getElementById('IMGZXXZCLIENTACHETEURZXXZSTOPMAILACHETEURZXXZV').getParent().click(); // Client stop email
    }
  }

  __validateSelectedFields() {
    document.getElementById('validation').click();
  }

  __startRequest() {
    document.getElementById('validation').click();
  }

  __verifyRequestIsDone() {
    console.log(
      '6. (Bis) VMobility Is Saying : ' +
        document.body.textContent
          .substr(0, 25)
          .replace(/[\n\t\r"]/g, '')
          .trim()
    );
    return (
      document.body.textContent &&
      (document.querySelectorAll('form[name=resultat] table tbody tr').length ||
        document.body.textContent.toLowerCase().indexOf('traitement de la requête') === -1)
    );
  }

  __scrapIt() {
    var rows = document.querySelectorAll('form[name=resultat] table tbody tr');
    var cells = [];
    var csvSeparator = ';';
    var cellsOffset = 1;
    var result = '';

    function cleanStr(str) {
      return str.replace(csvSeparator, '').replace('\t\r\n', '').trim();
    }
    for (var i = 0; i < rows.length; ++i) {
      if (rows[i].querySelectorAll('td').length) {
        cells = rows[i].querySelectorAll('td');
        for (var j = cellsOffset; j < cells.length; ++j) {
          result += cells[j].innerText ? cleanStr(cells[j].innerText) : '';
          result += csvSeparator;
        }
        result += '\n';
      }
    }
    return result;
  }
}

module.exports = VmobilityScrapper;
