// Synthetic fixture: a GraphQL-only service. Bruno supports GraphQL; this skill does not
// generate it, so this must be reported as skipped and exit 3.
const { ApolloServer } = require('@apollo/server');

const typeDefs = `
  type Query {
    widgets: [String!]!
  }
`;

const server = new ApolloServer({ typeDefs });
module.exports = server;
