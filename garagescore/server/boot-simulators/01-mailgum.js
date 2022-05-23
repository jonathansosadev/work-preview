const config = require('config');
const viperHTML = require('viperhtml');
const moment = require('moment-timezone');
const bodyParser = require('body-parser');
const multer = require('multer');
const rest = require('restler');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const simpleParser = require('mailparser').simpleParser;
const gsClient = require('../../common/lib/garagescore/client');

const upload = multer();
const emailList = [];
const dateUp = moment().tz('Europe/Paris').format('DD MMMM YYYY HH:mm:ss');
const webhookUrl = `${config.get('publicUrl.app_url')}/webhook/mailgun/`;

module.exports = function mountMailguM(app) {
  const ensureGs = (r, rs, n) => {
    if (r.user.email.match(/@garagescore\.com|@custeed\.com/)) {
      n();
      return;
    }
    rs.status(403).send('');
  };
  const urlencodedParser = bodyParser.urlencoded({ extended: false });
  const prettyDate = (d) => moment(d).tz('Europe/Paris').format('DD MMMM YYYY HH:mm:ss');
  const dropUrl = (email) => `${gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM}/drop/${email.id}`;
  const attachmentUrl = (email, attachment) =>
    `${gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM}/attachment/${email.id}/${attachment.path.split('/').pop()}`;
  const buildToPush = (m) => ({
    date: Date.now(),
    from: m.from.text.toString(),
    to: m.to.text.toString(),
    subject: m.subject.toString(),
    body: m.html.toString(),
    id: emailList.length,
  });

  app.get(
    gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGs,
    (req, res) => {
      const render = viperHTML.wire();

      const Attachments = (email, attachment, i) => viperHTML.wire(email)`
      <a style="margin-right:10px;" href="${attachmentUrl(email, attachment)}" download="${attachment.name}">${
        attachment.name
      }</a>
    `;
      const Email = (email) => viperHTML.wire(email)`
    <div onclick="toggle(this)" data-id="${email.id}" style="cursor:pointer; width:900px" >
    <b>${email.subject}</b>
    <span style="float:right">Le ${prettyDate(email.date)}</span>
    </div>
    <div id="${email.id}" style="display:none">
    <form action="${dropUrl(email)}" target="_self" method="post"><input type="submit" value="Drop"></form>
    ${email.attachment ? 'Pièces jointes: ' : ''}
    ${email.attachment ? email.attachment.map((pj, i) => Attachments(email, pj, i)) : ''}<br/>
    <b style="display:inline-block; width: 70px;">From</b>&nbsp;${email.from}<br/>
    <b style="display:inline-block; width: 70px;">To</b>&nbsp;${email.to}<br/>
    <div style="width: 800px;border-left: 6px solid #ccc!important;padding-left: 10px;">${{ html: email.body }}</div>
    </div>
    <hr/>`;

      const html = render`<html><head>
    <title>MailguM</title>
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
      <b>Emails reçus: </b> ${emailList.length} (depuis le ${dateUp})<br/>
      <br/><b>Derniers emails </b> <br/><hr/>
      ${emailList.slice().reverse().map(Email)}
      </body></html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    }
  );

  app.get(
    `${gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM}/attachment/:emailId/:fileId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGs,
    (req, res) => {
      if (!req.params.emailId || req.params.emailId > emailList.length - 1) {
        res.status(400).send('Bad requesterino, bad emailId');
        return;
      }
      const attachments = emailList[req.params.emailId].attachment;
      const file = attachments ? attachments.find((pj) => pj.path === `/tmp/${req.params.fileId}`) : null;
      if (!req.params.fileId || !file) {
        res.status(400).send('Bad requesterino, bad fileId');
        return;
      }
      res.download(file.path, file.name || file.path);
    }
  );

  app.post(
    `${gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM}/drop/:emailId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    ensureGs,
    async (req, res) => {
      if (!req.params.emailId || req.params.emailId > emailList.length - 1) {
        res.status(400).send('Bad requesterino');
      } else {
        const id = req.params.emailId;
        const mailgunEvent = {
          event: 'dropped',
          recipient: emailList[id].to,
          signature: 'mailgum',
          contactId: emailList[id].contactId,
          timestamp: Date.now(),
        };
        if (config.util.getEnv('NODE_APP_INSTANCE') !== 'review') {
          rest
            .post(webhookUrl, { mailgunEvent })
            .on('complete', (d, r) =>
              res.status(r.statusCode).redirect(gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM)
            )
            .on('error', (err) => res.status(400).send(err.toString()));
        } else {
          if (mailgunEvent.alertMailId || mailgunEvent.contactId || mailgunEvent.campaignContactId) {
            try {
              await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent)
              res.status(200).redirect(gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM);
            } catch (err) {
              res.status(400).send(err.toString())
            }
          } else {
            let err =
              'Warning: Mailgun - Neither `contactId`, `campaignContactId` or `alertMailId` has been send in Mailgun Event : ' +
              JSON.stringify(mailgunEvent);
            console.log(err);
            res.status(400).send(err);
          }
        }
      }
    }
  );

  app.post(`${gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM}/v3/*/messages`, urlencodedParser, (req, res) => {
    try {
      const b = req.body;
      if (b.attachment && !Array.isArray(b.attachment)) {
        b.attachment = [b.attachment];
      }
      emailList.push({
        date: Date.now(),
        from: b.from,
        to: b.to,
        subject: b.subject,
        body: b.html || b.body,
        attachment: b.attachment,
        id: emailList.length,
        contactId: b['v:contactId'],
      });
    } catch (e) {
      console.error(e);
    }
    res.send({ id: '20170503204246.3678.22829.10F774EA@mailgum.org', message: 'Queued. Thank you.' });
  });

  app.post(
    `${gsClient.url.getUrlNamespace('SIMULATORS').MAILGUM}/v3/*/messages.mime`,
    upload.single('message'),
    (req, res) => {
      try {
        simpleParser(req.file.buffer.toString(), (errParse, mail) => {
          if (errParse) {
            console.error(errParse);
          } else {
            emailList.push(buildToPush(mail));
          }
        });
      } catch (e) {
        console.error(e);
      }
      res.send({ id: '20170503204246.3678.22829.10F747EA@mailgum.org', message: 'Queued. Thank you.' });
    }
  );
};
