const moment = require('moment');
const graphql = require('graphql');
const GraphQLDate = require('graphql-date');

module.exports = new graphql.GraphQLObjectType({
  name: 'Webinar',
  fields: {
    webinarId: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLID),
    },
    webinarKey: {
      type: graphql.GraphQLString,
    },
    subject: {
      type: graphql.GraphQLString,
    },
    description: {
      type: graphql.GraphQLString,
    },
    times: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'WebinarTime',
          fields: {
            startTime: { type: GraphQLDate },
            endTime: { type: GraphQLDate },
          },
        })
      ),
      resolve(webinar) {
        return webinar.times.map((time) => ({
          startTime: moment(time.startTime).toDate(),
          endTime: moment(time.endTime).toDate(),
        }));
      },
    },
  },
});
