/**
 * Display a banner to show the current branch during our reviews
 */
const request = require('request');

module.exports = function mountBranchBanner(app) {
  app.get('/reviewsbanner.js', (req, res) => {
    if (process.env.HEROKU_APP_NAME !== 'next-garagescore') {
      res.status(200).send('');
      return;
    }
    res.status(200).send(`
      var revFrame = document.createElement("div");
      revFrame.id = "revFrame";
      revFrame.innerHTML = "<a target='_blank' href='https://github.com/garagescore/garagescore/branch_commits/${process.env.HEROKU_SLUG_COMMIT}'>Branche</a>";
      var rootRevFrame = document.getElementById('__layout') || document.body;
      rootRevFrame.insertBefore(revFrame, rootRevFrame.childNodes[0]);
      var revCss = document.createElement("style");
      revCss.type = "text/css";
      revCss.innerHTML = "#revFrame a, #revFrame a:visited { text-decoration: none; color: white;  } #revFrame { position: fixed; bottom: 0; left: 0; background: #e25201; z-index: 200;padding: 5px; }";
      document.body.appendChild(revCss);
    `);
  });
};
