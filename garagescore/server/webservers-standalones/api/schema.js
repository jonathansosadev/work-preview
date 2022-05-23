const glob = require('glob');
const path = require('path');

// _empty is here to not raise errors (empty type is forbidden)
const Query = `
  type Query {
    _empty: String
    authenticationError: String
  }
`;
const Mutation = `
  type Mutation {
    _empty: String
    authenticationError: String
  }
`;
const typeDefs = [];
const resolversMap = {};
glob.sync('server/webservers-standalones/api/schema/*.js').forEach(function (file) {
  console.log(file);
  const { typeDef, resolvers } = require(path.resolve(file));
  typeDefs.push(typeDef);
  for (const resolverType in resolvers) {
    resolversMap[resolverType] = { ...(resolversMap[resolverType] || {}), ...resolvers[resolverType] };
  }
});
glob.sync('server/webservers-standalones/api/schema/*/*.js').forEach(function (file) {
  console.log(file);
  const { typeDef, resolvers } = require(path.resolve(file));
  typeDefs.push(typeDef);
  for (const resolverType in resolvers) {
    resolversMap[resolverType] = { ...(resolversMap[resolverType] || {}), ...resolvers[resolverType] };
  }
});
module.exports = {
  typeDefs: [Query, Mutation, ...typeDefs],
  resolvers: resolversMap,
};
