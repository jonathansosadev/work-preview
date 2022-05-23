const viperHTML = require('viperhtml');
const moment = require('moment-timezone');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../common/lib/garagescore/client');

const smsList = [];
const dateUp = moment().tz('Europe/Paris').format('DD MMMM YYYY HH:mm:ss');

module.exports = function mountSmsDoctor(app) {
  const ensureGs = (r, rs, n) => {
    if (r.user.email.match(/@garagescore\.com|@custeed\.com/)) {
      n();
      return;
    }
    rs.status(403).send('');
  };
  const prettyDate = (d) => moment(d).tz('Europe/Paris').format('DD MMMM YYYY HH:mm:ss');
  const urlParse = (t) =>
    t.replace(/(http:\/\/[^\s]+)/gi, '<a href="$1">$1</a>').replace(/(https:\/\/[^\s]+)/gi, '<a href="$1">$1</a>');

  app.get(
    gsClient.url.getUrlNamespace('SIMULATORS').SMSDOCTOR,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGs,
    (req, res) => {
      const render = viperHTML.wire();

      const Sms = (sms) => viperHTML.wire(sms)`
    <div onclick="toggle(this)" data-id="${sms.id}" style="cursor:pointer; width:900px" >
    <b>${sms.phoneNumber}</b>
    <span style="float:right">Le ${prettyDate(sms.date)}</span>
    </div>
    <div id="${sms.id}" style="display:none">
    <b style="display:inline-block; width: 70px;">From</b>&nbsp;${sms.from}<br/>
    <div style="width: 800px;border-left: 6px solid #ccc!important;padding-left: 10px;">${{ html: sms.text }}</div>
    </div>
    <hr/>`;

      const html = render`<html><head>
    <title>SMSDoctor</title>
    <base target="_blank">
    <script>
    function toggle(e) {
      var id = e.getAttribute('data-id');
      var element = document.getElementById(id);
      if (element.style.display == "none") {
        element.style.display = "block";
      } else {
         element.style.display = "none";
      }
    }
    </script>
    </head><body>
      <b>SMS reçus: </b> ${smsList.length} (depuis le ${dateUp})<br/>
      <br/><b>Derniers SMS</b> <br/><hr/>
      ${smsList.slice().reverse().map(Sms)}
      </body></html>`;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');

      res.send(html);
    }
  );

  app.post(`${gsClient.url.getUrlNamespace('SIMULATORS').SMSDOCTOR}`, (req, res) => {
    smsList.push({
      date: Date.now(),
      from: req.body.sms.message.sender,
      phoneNumber: req.body.sms.recipients.gsm[0].value,
      text: req.body.sms.message.text,
      urlParsedText: urlParse(req.body.sms.message.text),
      pushtype: req.body.sms.message.text,
      id: smsList.length,
    });
    res.status(200).send({ message: 'OK', sent: 1 });
  });
};
