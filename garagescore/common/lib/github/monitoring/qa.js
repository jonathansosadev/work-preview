const { promisify } = require('util');
const { getApi } = require('../github-rest-api');
const { postMessage } = require('../../slack/client');
const { fromGithubToSlack } = require('../../garagescore/custeed-users');
const { log, JS } = require('../../util/log');

const slack = promisify(postMessage);
/**
 * Use the github api to monitor the open pull requests
 */
module.exports = async ({ sendToSlack = false, sendToConsole = true } = {}) => {
  let pullRequests;
  try {
    pullRequests = await getApi('/repos/garagescore/garagescore/pulls?per_page=100&state=open');
  } catch (e) {
    log.error(JS, e.message);
    log.error(JS, e.response);
    return;
  }
  const assignees = pullRequests.map((pr) => pr.assignees && pr.assignees[0] && pr.assignees[0].login).filter((a) => a);
  const prPerRevievers = {};
  // get reviewers login (we can have many reviewers per pr, so we use reduce)
  const reviewers = pullRequests.reduce(function (acc, pr) {
    return [...acc, ...pr.requested_reviewers.map((r) => r.login)];
  }, []);
  //count pr per reviewers
  reviewers.forEach((a) => {
    if (!prPerRevievers[a]) prPerRevievers[a] = 0;
    prPerRevievers[a]++;
  });
  // count
  const prPerAssignees = {};
  assignees.forEach((a) => {
    if (!prPerAssignees[a]) prPerAssignees[a] = 0;
    prPerAssignees[a]++;
  });

  // get uniq users
  const users = [...new Set([...Object.keys(prPerRevievers), ...Object.keys(prPerAssignees)])];
  const lines = [];
  const warned = {};
  const warnReviews = (u) => {
    return `*${prPerRevievers[u]}* PR en attente de <https://github.com/garagescore/garagescore/pulls/review-requested/${u}|ta review>`;
  };
  const warnAssignements = (u) => {
    const t = `ouverte${prPerAssignees[u] > 1 ? 's' : ''}`;
    return `*${prPerAssignees[u]}* PR <https://github.com/garagescore/garagescore/pulls/assigned/${u}|${t}>`;
  };
  // mark users with too many prs to review or assigned
  users.forEach((u) => {
    if (prPerRevievers[u] && prPerRevievers[u] > 3) {
      warned[u] = true;
    }
    if (prPerAssignees[u] && prPerAssignees[u] > 3) {
      warned[u] = true;
    }
  });
  users
    .sort((a, b) => {
      return fromGithubToSlack(a).toLowerCase().localeCompare(fromGithubToSlack(b).toLowerCase()); // order alpha
    })
    .forEach((u) => {
      let s = `@${fromGithubToSlack(u)} : `;
      if (prPerRevievers[u]) {
        s = `${s} ${warnReviews(u)}`;
      }
      if (prPerAssignees[u]) {
        if (prPerRevievers[u]) {
          s += ', ';
        }
        s = `${s} ${warnAssignements(u)}`;
      }
      if (warned[u]) s += ' :warning:';
      lines.push(s);
    });
  if (sendToSlack) {
    await slack({
      channel: `#team-prod_qa`,
      username: '[Github] Monitoring',
      text: `*Monitoring des Pull Requests*\n${lines.join('\n')}`,
    });
  }
  if (sendToConsole) {
    console.log(lines.join('\n'));
  }
};
