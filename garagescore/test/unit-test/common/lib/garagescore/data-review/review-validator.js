const expect = require('chai').expect;
const TestApp = require('../../../../../../common/lib/test/test-app');
const { shouldApprove } = require('../../../../../../common/lib/garagescore/data-review/review-validator');
const moderationStatus = require('../../../../../../common/models/data/type/moderation-status');
const rejectedReasons = require('../../../../../../common/models/data/type/rejected-reasons');

const app = new TestApp();

describe('Comments: Auto Moderation', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
  });

  it('approved comments', async () => {
    const comments = [
      "Pour l'instant je suis satisfaite de l'accueil et des révisions (sauf les prix....) mais je pense que c'est le cas de beaucoup de personnes.",
      "Merci d'avoir pris le temps de nous répondre. Nous sommes honorer que votre intervention se soit mal passée. A jamais.",
      "2h pour l'entretien mon véhicule, je trouve cela un peu long à ajouter à la modération pbl",
      'Livraison prévue le 10/03/2018 et réception le 11/01/2018. Un succès !!!',
      'Le garage a réussi à me dépanner à j+1 après bris de glace...',
      'Accueil avec cafe et viennoiseries et serieux du reparateur',
      ' toujours bien accueillie et reparation correcte au devis',
      "c 'était pour un contrôle technique",

      ' efficacité et réactivité',
      'tout à fait satisfait',
      'vite fait bien fait',
      'je suis satisfait',
      'Au top la classe',
      'C était parfait',
      'Service correct',
      'rien à signaler',
      'Travail sérieux',
      'garage serieux',
      'Bien accueilli',
      'bien satisfait',
      'garage sérieux',
      'très satisfait',
      'vente efficace',
      'rien à redire',
      'a recommander',
      'Très heureux',
      'Génial super',
      'Fantastique',
      "C'est bien",
      'Tout est OK',
      'top niveau',
      'bon garage',
      'Garage pro',
      'todo genial',
    ]; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    for (const comment of comments) {
      const res = await shouldApprove(comment, fullName);
      expect(res.rejectedReason).to.be.undefined;
      expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
    }
  });
  it('approved with a lot of spaces', async () => {
    const comment = `Cette fois un gros effort à été fait pour satisfaire ma
    demande, le personnel plus compréhensif!

    Merci                                                                    Lau`;

    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.rejectedReason).to.be.undefined;
    expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
  });
});
describe('Should reject', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
  });
  it('refused gibberish', async () => {
    const comment = 'gebtrrfbgsdf sdfs dfsdd ertbetrbrtetr ertbertert'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_MEANINGLESS);
  });
  it('refused too short', async () => {
    const comment = 'court'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_TOO_SHORT);
  });
  it('refused too short with spaces', async () => {
    const comment = 'Rien.                                                               \n'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_TOO_SHORT);
  });
  it('only numbers', async () => {
    const comment = '01234567890123456789'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_MEANINGLESS);
  });
  it('.......................', async () => {
    const comment = '.........................................'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_MEANINGLESS);
  });
  it('gib', async () => {
    const comment = 'sdasdasdfs dsf ds fds'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_MEANINGLESS);
  });
  it('personnal data 1', async () => {
    const comment = 'tres professionnel des révisions (sauf les prix....) mais je pense. signé:minneboo'; // eslint-disable-line max-len
    const fullName = 'Minneboo Jose';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data 2', async () => {
    const comment = 'tres professionnel des révisions (sauf les prix....) mais je pense. signé:minneboo-jose'; // eslint-disable-line max-len
    const fullName = 'Minneboo-Jose';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data 3', async () => {
    const comment = 'tres professionnel des révisions (sauf les prix....) mais je pense. signé:minneboo_jose'; // eslint-disable-line max-len
    const fullName = 'Minneboo_Jose';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data 4', async () => {
    const comment =
      "Il n'y  a pas beaucoup  d annonces  sur votre site surtout celui de langon comment ce  fait t-il que chez le concessionnaire kia dans le département  64 il y a 3000 euros de remise sur un véhicule  neuf et qu' en gironde vous ne pratique pas cette remise (en attente d'une réponse de votre part mr seurat)je remercie mr Haute  mathieu  cordialement Mde Lavigne\""; // eslint-disable-line max-len
    const fullName = 'Lavigne, Marie-Agnes';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data email', async () => {
    const comment = 'envoi courrier à tioto@oo.fr'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data phone', async () => {
    const comment = ' je peux vous en parler au téléphone RMB 0685206926'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data url', async () => {
    const comment = 'Allez sur mon site www.garagescore.com'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('personnal data Names', async () => {
    const comment = 'Jean est un être sans coeur.'; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_INCLUDES_PERSONAL_DATA);
  });
  it('abusive', async () => {
    const comment = "Une dame pas aimable et qui prend de haut a l'acceuil... Bref bande de cons"; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_ABUSIVE);
  });
  it('abusive accents', async () => {
    const comment = "Une dame pas aimable et qui prend de haut a l'acceuil... Bref bande de débile"; // eslint-disable-line max-len
    const fullName = 'V. J. L.';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.REJECTED);
    expect(res.rejectedReason).to.equal(rejectedReasons.CONTENT_IS_ABUSIVE);
  });
});
describe('Should not crash on special strings', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.addCensoredWords({
      language: 'fr',
      words: ['connard', 'putain', 'con', 'debile', 'Jean'],
    });
  });
  it('Should not crash', async () => {
    const comment = 'Je suis très satisfait du service, à bientôt';
    const fullName = '(toto';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
    expect(res.rejectedReason).to.be.undefined;
  });
  it('Should not crash', async () => {
    const comment = 'Je suis très satisfait du service, à bientôt';
    const fullName = '(*********----';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
    expect(res.rejectedReason).to.be.undefined;
  });
  it('Should not crash', async () => {
    const comment = 'Je suis très satisfait du service, à bientôt';
    const fullName = '(tot^*^$*^$o';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
    expect(res.rejectedReason).to.be.undefined;
  });
  it('Should not crash', async () => {
    const comment = 'Je suis très satisfait du service, à bientôt';
    const fullName = '[[[[[[++++++;;;;;;;######"`]]]]]]';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
    expect(res.rejectedReason).to.be.undefined;
  });
  it('Should not crash', async () => {
    const comment = 'Je suis très satisfait du service, à bientôt';
    const fullName = '`';
    const res = await shouldApprove(comment, fullName);
    expect(res.approvableStatus).to.equal(moderationStatus.APPROVED);
    expect(res.rejectedReason).to.be.undefined;
  });
});
