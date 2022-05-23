const rest = require('restler');
const conf = require('config');

class ReviewController {
  static index(req, res) {
    res.render('teamtools/review/index.nunjucks', {
      user: req.user.email.replace('@garagescore.com', '').replace('@custeed.com', ''),
    });
  }

  static getProjectsList(req, res) {
    const url = 'https://api.github.com/repos/garagescore/garagescore/projects';
    const options = { headers: this._headers };
    const extReq = rest.get(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', (result) => {
        this._sendResponse(res, 200, result);
      });
  }

  static getProjectColumns(req, res) {
    const url = 'https://api.github.com/projects/:projectId/columns'.replace(':projectId', req.params.projectId);
    const options = { headers: this._headers };
    const extReq = rest.get(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', (result) => {
        this._sendResponse(res, 200, result);
      });
  }

  static getColumnCards(req, res) {
    const url = 'https://api.github.com/projects/columns/:columnId/cards'.replace(':columnId', req.params.columnId);
    const options = { headers: this._headers };
    const extReq = rest.get(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', (result) => {
        this._sendResponse(res, 200, result);
      });
  }

  static addNote(req, res) {
    const url = 'https://api.github.com/projects/columns/:columnId/cards'.replace(':columnId', req.params.columnId);
    const msg = `${req.user.email.replace('@garagescore.com', '').replace('@custeed.com', '')} : ${req.body.note}`;
    const options = { headers: this._headers, data: JSON.stringify({ note: msg }) };
    const extReq = rest.post(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', (result) => {
        this._sendResponse(res, 200, result);
      });
  }

  static deleteNote(req, res) {
    const url = 'https://api.github.com/projects/columns/cards/:cardId'.replace(':cardId', req.params.cardId);
    const options = { headers: this._headers };
    const extReq = rest.del(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', () => {
        this._sendResponse(res, 200, { msg: 'ok' });
      });
  }

  static updateNote(req, res) {
    const url = 'https://api.github.com/projects/columns/cards/:cardId'.replace(':cardId', req.params.cardId);
    let msg = req.body.note;
    if (msg.indexOf(`${req.user.email.replace('@garagescore.com', '')} :`) === -1) {
      msg = `${req.user.email.replace('@garagescore.com', '')} : ${msg}`;
    }
    if (msg.indexOf(`${req.user.email.replace('@custeed.com', '')} :`) === -1) {
      msg = `${req.user.email.replace('@custeed.com', '')} : ${msg}`;
    }
    const options = { headers: this._headers, data: JSON.stringify({ note: msg }) };
    const extReq = rest.patch(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', (result) => {
        this._sendResponse(res, 200, result);
      });
  }

  static moveNote(req, res) {
    const url = 'https://api.github.com/projects/columns/cards/:cardId/moves'.replace(':cardId', req.params.cardId);
    const options = { headers: this._headers, data: JSON.stringify({ position: 'top', column_id: req.body.columnId }) };
    const extReq = rest.post(url, options);

    extReq
      .on('error', (err) => {
        this._sendResponse(res, 500, err);
      })
      .on('fail', (fail) => {
        this._sendResponse(res, 404, fail);
      })
      .on('timeout', () => {
        this._sendResponse(res, 500, 'GitHub Timeout');
      })
      .on('success', (result) => {
        this._sendResponse(res, 200, result);
      });
  }

  static get _headers() {
    return {
      Accept: 'application/vnd.github.inertia-preview+json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${conf.github.apiToken}`,
    };
  }

  /**
   * Send a HTTP response
   * @param res the 'res' entity provided by express
   * @param code the HTTP Status Code
   * @param data the data you wanna send, will be stringify
   * @private
   */
  static _sendResponse(res, code, data) {
    res.setHeader('Content-type', 'application/json');
    res.status(code);
    res.send(JSON.stringify(data));
  }
}

module.exports = ReviewController;
