const dataRecordUtil = require('./data-record/util.js');

const supportedPhones = [
  '+51 99 17 244 56', // Js
  '+33 6 32 50 82 85', // Olivier
  '+33 6 64 53 93 77', // BenDech
  '+33 6 03 87 56 92', // BB
  '+33 6 61 91 65 89', // Antoine
  '+33 6 32 50 65 47', // Alexis
  '+33 6 17 16 87 83', // Djilali
  '+33 6 34 18 71 68', // Romain
];

/** 
 * - go to #general on Slack
 * - click to see the members lists
 * - observe the network request to have a list of users 
 * 
 * something like
 [
  {
    "id": "U02PWJDFGQ7",
    "team_id": "T038QM7RD",
    "name": "aemmanuel",
    "deleted": false,
    "color": "684b6c",
    "real_name": "Adam EMMANUEL",
    ...
 * and then run
    users.reduce((o,u)=>{o[u.profile.email] = {slackId:u.id, slack: u.name}; return o}, {})
 * you will have
  'sfaid@garagescore.com': { slackId: 'UR95WJCSD', slack: 'sfaid' },
  'ssaman@garagescore.com': { slackId: 'U02EYHWSRSA', slack: 'ssaman' },
  'walleman@garagescore.com': { slackId: 'UPNVDDESD', slack: 'walleman' },
  'wmamani@garagescore.com': { slackId: 'U02DAR9P2TX', slack: 'wmamani' }
*/
const slackAccounts = {
  'aemmanuel@garagescore.com': { slackId: 'U02PWJDFGQ7', slack: 'aemmanuel' },
  'adasilvapatricio@garagescore.com': { slackId: 'U01BE5HEBD3', slack: 'adasilvapatricio' },
  'abiarneix@garagescore.com': { slackId: 'U0KU9TE21', slack: 'alexis' },
  'aponcet@garagescore.com': { slackId: 'U026L4L64CR', slack: 'aponcet' },
  'adelcroix@garagescore.com': { slackId: 'UPMF2TGUR', slack: 'adelcroix' },
  'agomez@garagescore.com': { slackId: 'UJR129J06', slack: 'agomez' },
  'atobok@garagescore.com': { slackId: 'U02SET2TTGW', slack: 'atobok' },
  'agondoin@garagescore.com': { slackId: 'U02ED6SEEHJ', slack: 'agondoin' },
  'awaszak@garagescore.com': { slackId: 'U02SAESB51U', slack: 'awaszak' },
  'bthielens@garagescore.com': { slackId: 'UT5NHA7DF', slack: 'bthielens' },
  'bbodrefaux@garagescore.com': { slackId: 'U06L9B4KW', slack: 'bb' },
  'bdechenaud@garagescore.com': { slackId: 'U06447JQ6', slack: 'bendech' },
  'clardeau@garagescore.com': { slackId: 'U9S4G6RFS', slack: 'clardeau' },
  'dkali@garagescore.com': { slackId: 'U2WELA5B7', slack: 'djillali' },
  'fdagorne@garagescore.com': { slackId: 'U02DC39U3RR', slack: 'fdagorne' },
  'flehuede@garagescore.com': { slackId: 'U02E83K8J73', slack: 'flehuede' },
  'jmariette@garagescore.com': { slackId: 'U02P6HFDN15', slack: 'jmariette' },
  'jrambaud@garagescore.com': { slackId: 'U02BTKL7N14', slack: 'jrambaud' },
  'jgautier@garagescore.com': { slackId: 'U02PJ8H844D', slack: 'jgautier' },
  'jscarinos@garagescore.com': { slackId: 'U0KLB0449', slack: 'js' },
  'ekraja@garagescore.com': { slackId: 'U01T81ARX60', slack: 'ekraja' },
  'ecodjia@garagescore.com': { slackId: 'U8T2W2CNQ', slack: 'ecodjia' },
  'mdoix@garagescore.com': { slackId: 'U014VBL4D60', slack: 'mdoix' },
  'mvozmediano@garagescore.com': { slackId: 'UGWRW353R', slack: 'mvozmediano' },
  'mollivier@garagescore.com': { slackId: 'U027RL79J87', slack: 'mollivier' },
  'mtheret@garagescore.com': { slackId: 'U014NRVCM4J', slack: 'mtheret' },
  'mgrihangne@garagescore.com': { slackId: 'U7TPPAFMY', slack: 'mgrihangne' },
  'mdiegonzalez@garagescore.com': { slackId: 'USMSBH430', slack: 'mdiegonzalez' },
  'mlaraki@custeed.com': { slackId: 'U01GQ3TUKJT', slack: 'mlaraki' },
  'mlaraki@garagescore.com': { slackId: 'U01HUN3BS2U', slack: 'mlaraki919' },
  'mkasrani@garagescore.com': { slackId: 'U4E2E64US', slack: 'mourad' },
  'naubert@garagescore.com': { slackId: 'U02HCMHUENL', slack: 'naubert' },
  'ndore@custeed.com': { slackId: 'U01SVK9LD3N', slack: 'ndore478' },
  'ndore@garagescore.com': { slackId: 'U01P8763XL7', slack: 'ndore' },
  'nmartinho@garagescore.com': { slackId: 'U02PPEJU37W', slack: 'nmartinho' },
  'oguillemot@garagescore.com': { slackId: 'U063J2J1W', slack: 'oliverguiz' },
  'pbaudvin@garagescore.com': { slackId: 'U97MA04NR', slack: 'pbaudvin' },
  'rlochereau@garagescore.com': { slackId: 'U02TB0AJYG2', slack: 'rlochereau' },
  'rdebrito@garagescore.com': { slackId: 'USAED5F6K', slack: 'rdebrito' },
  'rproquot@garagescore.com': { slackId: 'U02EDFQNX51', slack: 'rproquot' },
  'rgonzales@garagescore.com': { slackId: 'U02FHK1DVEV', slack: 'rgonzales' },
  'rbourbilieres@garagescore.com': { slackId: 'U6XBAL0TB', slack: 'rombo' },
  'skanto@garagescore.com': { slackId: 'USCHWDFHU', slack: 'skanto' },
  'sfaid@garagescore.com': { slackId: 'UR95WJCSD', slack: 'sfaid' },
  'ssaman@garagescore.com': { slackId: 'U02EYHWSRSA', slack: 'ssaman' },
  'walleman@garagescore.com': { slackId: 'UPNVDDESD', slack: 'walleman' },
  'wmamani@garagescore.com': { slackId: 'U02DAR9P2TX', slack: 'wmamani' },
  'ddemoniere@garagescore.com': { slackId: 'U0398PF40QP', slack: 'Didier Demoniere' },
};
/**
 * - go to https://github.com/orgs/garagescore/people
 * - export to json and run
 *  - suffer because github dont give us the email for each account
 */
const githubAccounts = {
  'aemmanuel@garagescore.com': { github: 'exnihilo0912' },
  'adasilvapatricio@garagescore.com': { github: 'dasilva-alex' },
  'abiarneix@garagescore.com': { github: 'alexisbiarneix' },
  'aponcet@garagescore.com': { github: 'alexisponcet' },
  'adelcroix@garagescore.com': { github: '' },
  'agomez@garagescore.com': { github: 'agventi' },
  'atobok@garagescore.com': { github: 'Aminetobok' },
  'agondoin@garagescore.com': { github: 'AntoineGondoin' },
  'awaszak@garagescore.com': { github: 'Aurelie-custeed' },
  'bthielens@garagescore.com': { github: 'bthielens' },
  'bbodrefaux@garagescore.com': { github: 'bb-gs' },
  'bdechenaud@garagescore.com': { github: 'BenjaminDechenaud' },
  'clardeau@garagescore.com': { github: 'Camilledollar' },
  'dkali@garagescore.com': { github: 'dkalicusteed' },
  'fdagorne@garagescore.com': { github: 'FabienCusteed' },
  'flehuede@garagescore.com': { github: 'FloLeh' },
  'jmariette@garagescore.com': { github: 'JeepayJipex' },
  'jrambaud@garagescore.com': { github: 'jeremy1910' },
  'jgautier@garagescore.com': { github: 'djodjo02130' },
  'jscarinos@garagescore.com': { github: 'jscari' },
  'ekraja@garagescore.com': { github: 'Ersiiii' },
  'ecodjia@garagescore.com': { github: 'ManuCusteed' },
  'mdoix@garagescore.com': { github: 'MDOIX' },
  'mvozmediano@garagescore.com': { github: 'Custeedmadrid' },
  'mollivier@garagescore.com': { github: 'mathieuollivier' },
  'mtheret@garagescore.com': { github: 'Bonjourjesuismaxime' },
  'mgrihangne@garagescore.com': { github: 'Michmich77' },
  'mdiegonzalez@garagescore.com': { github: 'mdiegonzalez' },
  'mlaraki@custeed.com': { github: 'mlaraki' },
  'mlaraki@garagescore.com': { github: 'mlaraki' },
  'mkasrani@garagescore.com': { github: 'mkasrani' },
  'naubert@garagescore.com': { github: 'PMNicolas' },
  'ndore@custeed.com': { github: 'nikodore' },
  'ndore@garagescore.com': { github: 'nikodore' },
  'nmartinho@garagescore.com': { github: 'NicolasM13' },
  'oguillemot@garagescore.com': { github: 'Oliverguiz' },
  'pbaudvin@garagescore.com': { github: 'PatochGS' },
  'rlochereau@garagescore.com': { github: '' },
  'rdebrito@garagescore.com': { github: 'RemyDBO' },
  'rproquot@garagescore.com': { github: 'rawb1' },
  'rgonzales@garagescore.com': { github: 'Gohanrga' },
  'rbourbilieres@garagescore.com': { github: 'rbourbilieres-gs' },
  'skanto@garagescore.com': { github: 'sarahkanto' },
  'sfaid@garagescore.com': { github: 'Sarah-pm' },
  'ssaman@garagescore.com': { github: 'simonsaman' },
  'walleman@garagescore.com': { github: 'wallemangaragescore' },
  'wmamani@garagescore.com': { github: 'wilsonfmamani' },
  'ddemoniere@garagescore.com': { github: 'didierdemoniere' },
};

const technicalTeam = ['jscarinos@garagescore.com', 'bbodrefaux@garagescore.com', 'smenard@garagescore.com'];

module.exports = {
  customerSuccessAliasEmail: 'customer_success@custeed.com',
  isGarageScoreUserByEmail(email) {
    return email && email.toString().match(/@garagescore\.com|@custeed\.com/);
  },
  isGarageScoreUserByPhone(phone) {
    const dr = dataRecordUtil.getFromRawData({ mobilePhone: phone });
    if (
      dr &&
      dr.importStats &&
      dr.importStats.dataValidity &&
      dr.importStats.dataValidity.customer &&
      dr.importStats.dataValidity.customer.contactChannel &&
      dr.importStats.dataValidity.customer.contactChannel.mobilePhone
    ) {
      for (let i = 0; i < supportedPhones.length; i++) {
        if (dr.customer.contactChannel.mobilePhone.number === supportedPhones[i]) {
          return true;
        }
      }
    }
    return false;
  },
  isGarageScoreTechnicalTeamMemberByEmail(email) {
    return email && technicalTeam.includes(email.toLowerCase());
  },
  fromGithubToSlack(githubUser) {
    const user = Object.keys(githubAccounts).find((key) => githubAccounts[key].github === githubUser);
    return (user && slackAccounts[user].slack) || `[fromGithubToSlack(${githubUser}) error]`;
  },
  fromGithubToSlackId(githubUser) {
    const user = Object.keys(githubAccounts).find((key) => githubAccounts[key].github === githubUser);
    return (user && slackAccounts[user].slackId) || `[fromGithubToSlack(${githubUser}) error]`;
  },
};
