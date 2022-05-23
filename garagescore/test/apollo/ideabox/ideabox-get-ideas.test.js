const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../../common/lib/test/test-app');
const sendQuery = require('../_send-query');

const { expect } = chai;
const app = new TestApp();

const ideasList = [
  {
    _id: '58e80f496d25c51a00725456',
    title:
      "Pour le suivi des leads, envisager un questionnaire à M+x en se servant du prétexte de l'évaluation du véhicule,pour savoir si il a concrétisé son achat et où il l'a effectué",
    author: 'awettling',
    category: 'Enquêtes',
    likes: [],
    comments: [],
    open: true,
    createdAt: new Date('2017-04-07T22:14:33.868Z'),
    updatedAt: new Date('2017-04-07T22:14:33.868Z'),
  },
  {
    _id: '5953d16b72687e1a008e027a',
    title: 'demande nomblot : ajouter dans les alertes le nom du réceptionnaire/vendeur',
    author: 'bbodrefaux',
    category: 'Alertes',
    likes: [],
    comments: [],
    open: true,
    createdAt: new Date('2017-06-28T15:55:23.693Z'),
    updatedAt: new Date('2017-06-28T15:55:23.693Z'),
  },
  {
    _id: '591d9b172ec0da1a00fb46dd',
    title: 'MB Paris : voir la nouvelle note du J+7 pour ceux qui ont dit "oui je souhiate changer ma note\n"',
    author: 'bbodrefaux',
    category: 'Cockpit',
    likes: ['oabida', 'bdechenaud', 'awettling', 'demo', 'abiarneix', 'adamase', 'eguillou', 'oguillemot'],
    comments: [],
    open: true,
    createdAt: new Date('2017-05-18T13:01:11.843Z'),
    updatedAt: new Date('2017-05-29T13:29:18.878Z'),
  },
  {
    _id: '591c6b240261751a00132b26',
    title: 'différencier le taux de recommandation par secteur (APV/VN/VO) sur cockpit',
    author: 'abiarneix',
    category: 'Prospection',
    likes: ['oabida', 'bdechenaud', 'demo', 'adamase', 'lfrechin', 'oguillemot'],
    comments: [],
    open: true,
    createdAt: new Date('2017-05-17T15:24:20.729Z'),
    updatedAt: new Date('2017-05-29T13:30:22.385Z'),
  },
  {
    _id: '591e9b5cffc7951a0045c024',
    title:
      "possibilité d'imprimer les médailles de score pour affichage façon TripAdvisor pour les hôtels (idée de P. Le Crom Opel Pontivy",
    author: 'bdechenaud',
    category: 'Marketing et Communication',
    likes: ['bdechenaud', 'dkali', 'cseguy', 'demo', 'eguillou', 'oguillemot'],
    comments: [],
    open: true,
    createdAt: new Date('2017-05-19T07:14:36.426Z'),
    updatedAt: new Date('2017-05-29T13:25:47.851Z'),
  },
  {
    _id: '5922ec00ba8e6a1a00586732',
    title: 'Ne pas comptabiliser la connexion "en tant que" quand nous allons sur la session d\'un client ',
    author: 'demo',
    category: 'Prospection',
    likes: [
      'oabida',
      'awettling',
      'demo',
      'dkali',
      'abiarneix',
      'adamase',
      'eguillou',
      'lfrechin',
      'oguillemot',
      'bdechenaud',
      'tauzou',
      'mkouakoukan',
    ],
    comments: [],
    open: true,
    createdAt: new Date('2017-05-22T13:47:44.509Z'),
    updatedAt: new Date('2018-03-21T15:12:41.068Z'),
  },
  {
    _id: '591f13aaffc7951a00467f94',
    title: 'Filtrer les taux de remplissage e-mail/sms sur analytics par secteur (APV vs VN/VO)',
    author: 'demo',
    category: 'Prospection',
    likes: ['oabida', 'abiarneix'],
    comments: [],
    open: true,
    createdAt: new Date('2017-05-19T15:47:54.360Z'),
    updatedAt: new Date('2017-05-23T09:16:08.065Z'),
  },
  {
    _id: '5923f270f372661a0096608f',
    title:
      "Pouvoir saisir les informations sur un Lead concrétiser dans cockpit et demander l'envoie d'une enquête de satisfaction.",
    author: 'oabida',
    category: 'Cockpit',
    likes: ['oabida', 'lfrechin', 'bdechenaud'],
    comments: [],
    open: true,
    createdAt: new Date('2017-05-23T08:27:28.056Z'),
    updatedAt: new Date('2017-05-31T14:12:53.929Z'),
  },
  {
    _id: '5923f249f372661a0096608b',
    title:
      "Fonction traitée / pas traité + remarque pour les clients mécontents (comme réalisé dans l'interface de gestion de la pression)\nObjectif : permettre la traçabilité et le partage d'informations entre les gestionnaires des clients mécontents chez nos clients",
    author: 'oguillemot',
    category: 'Prospection',
    likes: ['oabida', 'awettling', 'dkali', 'adamase', 'eguillou', 'oguillemot', 'bdechenaud'],
    comments: [
      {
        author: 'oabida',
        comment:
          "On peut donner la possibilité de choisir les colonnes à afficher dans cokpit de façon à afficher le mélange des colonnes actuellement sur cockpit et celle de la page 'qualification des contacts'",
        createdAt: new Date('2017-05-23T08:29:21.147Z'),
      },
    ],
    open: true,
    createdAt: new Date('2017-05-23T08:26:49.814Z'),
    updatedAt: new Date('2017-05-31T14:13:00.669Z'),
  },
  {
    _id: '592835719ab17c1a0024b89e',
    title:
      'Faire un certificat groupe ?\n=> faire pointer les widget groupes\n=> avoir des rich snippets pour les sites de groupes',
    author: 'jscarinos',
    category: 'Certificat',
    likes: ['tauzou', 'lfrechin', 'demo', 'bdechenaud', 'oabida'],
    comments: [
      {
        author: 'tauzou',
        comment: ':+1:',
        createdAt: new Date('2017-05-26T14:07:31.232Z'),
      },
    ],
    open: true,
    createdAt: new Date('2017-05-26T14:02:25.197Z'),
    updatedAt: new Date('2017-06-01T07:22:23.407Z'),
  },
];

const newIdea = {
  title: 'A new Idea',
  author: 'jscarinos',
  category: 'Certificat',
  likes: ['obama'],
  comments: [
    {
      author: 'obama',
      comment: ':+1:',
      createdAt: new Date(),
    },
  ],
  open: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
describe('apollo::ideabox-get-ideas', () => {
  beforeEach(async () => {
    await app.reset();
    for (let j = 0; j < ideasList.length; j++) {
      for (let i = 0; i < ideasList.length; i++) {
        delete ideasList[i]._id;
        await app.models.Idea.getMongoConnector().insertOne(ideasList[i]);
      }
    }
    await app.models.Idea.getMongoConnector().insertOne(newIdea);
  });

  it('IdeaboxGetIdeas pagination', async () => {
    let query = `query IdeaboxGetIdeas {
      IdeaboxGetIdeas {
        hasMore
        ideas {
          id
        }
      }
    }`;
    let queryRes = await sendQuery(app, query, {});
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    const { ideas, hasMore } = queryRes.data.IdeaboxGetIdeas;
    expect(ideas).to.be.an('Array').and.to.have.lengthOf(25);
    expect(hasMore).to.be.true;
    query = `query IdeaboxGetIdeas($after: String) {
      IdeaboxGetIdeas(after: $after) {
        hasMore
        ideas {
          id
        }
      }
    }`;
    const skip = 3;
    queryRes = await sendQuery(app, query, { after: ideas[skip - 1].id });
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    const next = queryRes.data.IdeaboxGetIdeas.ideas;
    expect(next).to.be.an('Array').and.to.have.lengthOf(25);
    expect(ideas[skip].id).equals(next[0].id);
    expect(ideas[skip + 1].id).equals(next[1].id);
    expect(ideas[skip + 2].id).equals(next[2].id);
  });
  it('IdeaboxGetIdeas focusIdea', async () => {
    let query = `query IdeaboxGetIdeas {
      IdeaboxGetIdeas {
        hasMore
        ideas {
          id
        }
      }
    }`;
    let queryRes = await sendQuery(app, query, {});
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    const { ideas } = queryRes.data.IdeaboxGetIdeas;
    const ideaId = ideas[10].id;
    query = `query IdeaboxGetIdeas($ideaId: String) {
      IdeaboxGetIdeas(ideaId: $ideaId) {
        hasMore
        ideas {
          id
        }
      }
    }`;
    queryRes = await sendQuery(app, query, { ideaId });
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    const next = queryRes.data.IdeaboxGetIdeas.ideas;
    expect(next).to.be.an('Array').and.to.have.lengthOf(1);
    expect(ideaId).equals(next[0].id);
  });
  it('IdeaboxGetIdeas fetch list of ideas', async () => {
    const query = `query IdeaboxGetIdeas {
      IdeaboxGetIdeas {
        hasMore
        ideas {
          id
          title
          author
          category
          likes
          comments {
            author
            comment
            createdAt
          }
          open
          isNew
          createdAt
          updatedAt
        }
      }
    }`;
    const queryRes = await sendQuery(app, query, {});
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    const { ideas, hasMore } = queryRes.data.IdeaboxGetIdeas;
    expect(ideas).to.be.an('Array').and.to.have.lengthOf(25);
    expect(hasMore).to.be.true;
    expect(ideas[0].title).equals(newIdea.title);
    expect(ideas[0].author).equals(newIdea.author);
    expect(ideas[0].category).equals(newIdea.category);
    expect(ideas[0].likes[0]).equals(newIdea.likes[0]);
    expect(ideas[0].comments[0].comment).equals(newIdea.comments[0].comment);
    expect(ideas[0].open).equals(newIdea.open);
    expect(ideas[0].createdAt.getTime()).equals(newIdea.createdAt.getTime());
    expect(ideas[0].updatedAt.getTime()).equals(newIdea.updatedAt.getTime());
    expect(ideas[0].open).equals(true);
  });
});
