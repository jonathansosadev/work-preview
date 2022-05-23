require('dotenv').config({ silent: true });
const { promisify } = require('util');
const { postMessage } = require('../../slack/client');
const { fromGithubToSlack, fromGithubToSlackId } = require('../../garagescore/custeed-users');
const { log, JS } = require('../../util/log');
const { getApi } = require('../github-rest-api');

const slack = promisify(postMessage);

/* return for one support_interne issue, its title, the gs issue the dev assigned, the pr number, if the qa started and if we have an error */
async function _getIssueInfos(supportInterneIssue) {
  const results = {
    supportInterneIssueNumber: supportInterneIssue.number,
    url: supportInterneIssue.html_url,
    title: supportInterneIssue.title,
    errorAutomaticMonitoringWentWrong: false,
    issueNumber: null,
    assignee: null,
    prNumber: null,
    qaStarted: null,
    closed: null,
  };

  const author = supportInterneIssue.user && supportInterneIssue.user.login;
  if (!author) {
    return results;
  }
  results.author = author;
  const currentAssignee =
    supportInterneIssue.assignees && supportInterneIssue.assignees[0] && supportInterneIssue.assignees[0].login;

  if (!currentAssignee) {
    return results;
  }
  results.currentAssignee = currentAssignee;
  if (currentAssignee === author) {
    results.waitingForTheAuthor = true;
    return results;
  }
  const events = await getApi(supportInterneIssue.timeline_url, { per_page: 100 });

  if (!events) {
    return results;
  }
  const crossReference = events.find(
    // check if we have an issue in garagescore
    (e) =>
      e.event === 'cross-referenced' &&
      e.source &&
      e.source.type === 'issue' &&
      e.source.issue.html_url.indexOf('https://github.com/garagescore/garagescore') === 0
  );
  if (!crossReference) {
    return results;
  }
  results.issueNumber = crossReference.source.issue.number;
  let issueURL = crossReference.source.issue.html_url
    .replace('https://github.com/', 'https://api.github.com/repos/')
    .replace('/pull/', '/pulls/'); // cant find the url in the crossReference object otherwise
  const issue = await getApi(issueURL, null, null);
  if (!issue) {
    results.errorAutomaticMonitoringWentWrong = true;
    return results;
  }

  const devAssignee = issue.assignees && issue.assignees[0] && issue.assignees[0].login;
  if (!devAssignee) {
    return results;
  }
  results.devAssignee = devAssignee;
  if (issue.url.indexOf('/pulls/')) {
    if (issue.closed_at) {
      results.closed = true;
      return results;
    }
    results.prNumber = issue.number;
    // to not do this for every pr
    // i thought about getting the project data and getting all the pr statuses at once but we need more perms
    const prEvents = await getApi(issue.events_url, { per_page: 100 });
    let moves = prEvents.filter((e) => e.event === 'moved_columns_in_project' || e.event === 'added_to_project');
    moves = moves.map((m) => m.project_card && m.project_card.column_name);
    results.qaStarted = moves.includes('Attente QA 👔') || moves.includes('Attente Review 🔎');
  } else {
    if (issue.closed_by) {
      results.closed = true;
      return results;
    }
    const gsIssueEvents = await getApi(issue.timeline_url);
    //console.log(gsIssueEvents);
    const pr = gsIssueEvents.find(
      // check if we have an issue in garagescore
      (e) =>
        e.event === 'cross-referenced' &&
        e.source &&
        e.source.type === 'issue' && // yes pr are issues for github
        e.source.issue.pull_request
    );
    if (!pr) {
      return results;
    }
    results.prNumber = pr.source.issue.number;
    // to not do this for every pr
    // i thought about getting the project data and getting all the pr statuses at once but we need more perms
    const prEvents = await getApi(pr.source.issue.events_url, { per_page: 100 });
    let moves = prEvents.filter((e) => e.event === 'moved_columns_in_project' || e.event === 'added_to_project');
    moves = moves.map((m) => m.project_card && m.project_card.column_name);
    results.qaStarted = moves.includes('Attente QA 👔') || moves.includes('Attente Review 🔎');
  }

  return results;
}
/**
 * Use the github api to monitor the support_interne and notify the issues creators about the current dev status
 *
 * overrideSlackUserId: instead of sending a private message to the ticket author, sent to a specific user or channel
 */
module.exports = async ({
  sendToSlack = false,
  sendToConsole = true,
  supportInterneIssueNumber = null,
  overrideSlackUserId = null,
} = {}) => {
  let issues;
  try {
    if (supportInterneIssueNumber) {
      const issue = await getApi(`/repos/garagescore/support_interne/issues/${supportInterneIssueNumber}`);
      issues = [issue];
    } else {
      const issuesP1 = await getApi(`/repos/garagescore/support_interne/issues?per_page=100&state=open&labels=P1`);
      const issuesP2 = await getApi(`/repos/garagescore/support_interne/issues?per_page=100&state=open&labels=P2`);
      const issuesP3 = await getApi(`/repos/garagescore/support_interne/issues?per_page=100&state=open&labels=P3`);

      issues = [...issuesP1, ...issuesP2, ...issuesP3];
    }
  } catch (e) {
    log.error(JS, e.stack);
    log.error(JS, e.response);
    return;
  }
  let assignees = issues.map((i) => i.user && i.user.login).filter((a) => a);
  assignees = [...new Set(assignees)];

  const titleAndURL = (d) => {
    //d is from _getIssueInfos
    return `*<${d.url}|${d.title}>*`;
  };
  const idAndURL = (d) => {
    // d is from_getIssueInfos
    return `*<${d.url}|${d.supportInterneIssueNumber}>*`;
  };
  let errors = [];
  // we will loop through everybody who created one or many tickets and checks her/his issues
  for (const user of assignees) {
    const userIssues = issues.filter((i) => (i.user && i.user.login) === user);
    let finished = [];
    let waiting = [];
    for (const issue of userIssues) {
      const data = await _getIssueInfos(issue);
      if (data.errorAutomaticMonitoringWentWrong) {
        errors.push(`${titleAndURL(data)} Erreur de monitoring, merci de vérifier manuellement l'état du ticket`);
      } else if (data.waitingForTheAuthor) {
        waiting.push(data);
      } else if (data.closed) {
        finished.push(data);
      } else {
        console.log(`Nothing to say about #${issue.number}`);
      }
    }
    let s = [];
    if (waiting.length) {
      const plur = (waiting.length > 1 && 's') || '';
      s.push(`*${waiting.length}* ticket${plur} en attente de retour (${waiting.map((d) => idAndURL(d)).join(',')})`);
    }
    if (finished.length) {
      const plur = (finished.length > 1 && 's') || '';
      s.push(
        `*${finished.length}* ticket${plur} fini${plur} et à fermer (${finished.map((d) => idAndURL(d)).join(',')})`
      );
    }
    if (s.length) {
      if (sendToSlack) {
        const text = `:warning: Bonjour ${fromGithubToSlack(user)}, Tu as ${s.join(', ')}`;
        await slack({
          channel: overrideSlackUserId ? overrideSlackUserId : fromGithubToSlackId(user),
          username: '[Github] Monitoring Support Interne',
          text,
        });

        const today = new Date();
        if (today.getDay() === 1) {
          const text = `@${fromGithubToSlack(user)} a ${s.join(', ')}`;
          //escalate to everybody on monday
          await slack({
            channel: `#support_interne`,
            username: '[Github] Monitoring Support Interne',
            text,
          });
        }
      }
      if (sendToConsole) {
        const text = `:warning: Bonjour ${fromGithubToSlack(user)}, Tu as ${s.join(', ')}`;
        console.log(text);
      }
    }
  }
};

if (require.main === module) {
  module.exports({
    sendToSlack: true,
    sendToConsole: true,
    overrideSlackUserId: process.argv[2],
    supportInterneIssueNumber: process.argv[3],
  });
}
