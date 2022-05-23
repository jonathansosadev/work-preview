const nunjucks = require('nunjucks');
const path = require('path');
const gsClient = require('../../../common/lib/garagescore/client');

module.exports = () => (req, res) => {
  // Configure Nunjucks
  const templates = path.normalize(path.join(__dirname, '../../..'));
  const nunjucksEnv = nunjucks.configure(templates, { autoescape: true, watch: false });
  nunjucksEnv.addGlobal('lib', { client: gsClient });
  const content = nunjucksEnv.render('common/templates/errors/error.nunjucks', {
    message: 'Page introuvable',
    description:
      'La page que vous avez demandée n’a pas été trouvée. Il se peut que le lien utilisé <br/>' +
      "n'existe plus ou que vous ayez tapé l’adresse (URL) incorrectement.",
  });
  res.status(404).send(content);
};
