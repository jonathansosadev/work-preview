'use strict';

var _ = require('underscore');
var debug = require('debug')('garagescore:bin:pouillart-bot'); // eslint-disable-line no-unused-vars
var parseArgs = require('minimist');
var slackClient = require('../common/lib/slack/client');
var Q = require('q');

/* Config */

var samplePouillartMessages = [
  'C’est contre le vent, et non dans le sens du vent, que les cerfs-volants volent le plus haut.',
  'Le business n’est pas un restaurant, mais un buffet. Si vous attendez qu’on vous serve, vous n’aurez rien. Il faut aller vous servir.',
  'Il faut être convaincu pour être convaincant. Car celui qui n’est pas convaincu se retrouve vite con et vaincu.',
  'En ces temps de grande turbulence, le plus grand danger, n’est pas la turbulence, mais d’agir avec la logique d’hier',
  'Seul on va plus vite, ensemble on va plus loin',
  'Si vous faites ce que vous avez toujours fait, votre avenir sera identique à votre passé',
  'Bonjour Guillaume',
  'La confiance des clients arrive à pied, et repart à cheval',
];

/* Command Line Arguments */

var argv = parseArgs(process.argv.slice(2));

var message = argv.message;
if (typeof message === 'undefined') {
  message = _.sampe(samplePouillartMessages);
}

Q.nfcall(slackClient.postMessage, {
  text: message,
  channel: '#general',
  username: 'Didier Pouillart Consulting',
  icon_url: 'https://media.licdn.com/mpr/mpr/p/5/000/1f6/004/19653e7.jpg',
}).done();
