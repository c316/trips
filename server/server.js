import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';
import typeDefs from '/imports/api/schema';
import resolvers from '/imports/api/resolvers';

const logger = { log: e => logger.info(e) };

const schema = makeExecutableSchema({
  typeDefs: typeDefs.typeDefs,
  resolvers: resolvers.resolvers,
});

createApolloServer({
  graphiql: true,
  schema,
});
