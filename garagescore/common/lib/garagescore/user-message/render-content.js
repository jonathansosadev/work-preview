// TO REMOVE AFTER 01/06/2019
// /**
//  * Generate Report mails Body(Html, text, subject) from templates
//  */
// const nunjucks = require('nunjucks');
// const path = require('path');
// const juice = require('juice');
// const moment = require('moment');
// require('moment-timezone');
// const gsClient = require('../../../../common/lib/garagescore/client.js');
// const stringUtil = require('../../../../common/lib/string/util');
//
// const nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../../../../common/')), {
//   autoescape: true,
//   watch: false,
// });
// const formatDates = function formatDates(date, format) {
//   if (!date || !moment(date).isValid()) {
//     return '--';
//   }
//   return moment.tz(date, 'Europe/Paris').format(format || 'DD MMMM YYYY');
// };
// nunjucksEnv.addFilter('addPreposition', stringUtil.addPreposition);
// nunjucksEnv.addFilter('encodeUrl', encodeURI);
// nunjucksEnv.addGlobal('lib', { client: gsClient });
// nunjucksEnv.addGlobal('formatDates', formatDates);
//
// const nunjucksEnvText = nunjucks.configure(path.normalize(path.join(__dirname, '../../../../common/')), {
//   autoescape: false,
//   watch: false,
// });
// nunjucksEnvText.addFilter('addPreposition', stringUtil.addPreposition);
// nunjucksEnvText.addGlobal('lib', { client: gsClient });
//
// const getUserMessageContent = function getReportContent(contact, callback) {
//   try {
//     callback(null, {
//       subject: nunjucksEnvText.render('./templates/email/user-message/user-message-subject.nunjucks', contact.payload),
//       textBody: nunjucksEnvText.render('./templates/email/user-message/user-message-txt.nunjucks', contact.payload),
//       htmlBody: juice(
//         nunjucksEnv.render('./templates/email/user-message/user-message-html.nunjucks', contact.payload),
//         { preserveMediaQueries: true }
//       ),
//     });
//   } catch (e) {
//     callback(e);
//   }
// };
//
// module.exports = {
//   getUserMessageContent,
// };
