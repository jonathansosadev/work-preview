const google = require('../../../common/lib/util/google.js');
const SourceTypes = require('../../../common/models/data/type/source-types.js');

module.exports = {
  // GET backoffice/reviews/add
  addIndex: (app, req, res) => {
    // get garages list in db
    app.models.Garage.find({ fields: { id: true, publicDisplayName: true } }, (err, garageModelInstances) => {
      const garages = garageModelInstances
        .map((garage) => {
          const g = {};
          g.id = garage.id;
          g.publicDisplayName = garage.publicDisplayName;
          return g;
        })
        .sort((g1, g2) => g1.publicDisplayName.localeCompare(g2.publicDisplayName)); // Sort by publicDisplayName
      res.render('darkbo/darkbo-api/add-review.nunjucks', {
        current_tab: 'api',
        garages,
      });
    });
  },
  // POST backoffice/reviews/reply
  reply: async (app, req, res) => {
    // Only for backoffice. Front-end: please go to : garagescore/api/graphql/mutations/review/reply.js
    const garageId = req.query.garageId;
    const dataId = req.query.dataId;
    const replyText = req.body.comment;

    const garage = await app.models.Garage.findById(garageId);
    const data = await app.models.Data.findById(dataId);
    if (data.get('source.type') === SourceTypes.GOOGLE) {
      const resGoogle = await google.reply(
        garage.exogenousReviewsConfigurations.Google.token,
        data.get('source.sourceId'),
        replyText
      );
      console.log(resGoogle);
    }
    console.log('Replying on:', garage.exogenousReviewsConfigurations[data.get('source.type')]);
    data.set('review.reply.text', replyText);
    data.save((errSave, dataSaved) => {
      res.json(dataSaved);
    });
  },
};
