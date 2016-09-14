import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import typeDefs from '/imports/api/schema';
import resolvers from '/imports/api/resolvers';
const logger = { log: (e) => console.log(e) };

const schema = makeExecutableSchema({
  typeDefs: typeDefs.typeDefs,
  resolvers: resolvers.resolvers,
});

createApolloServer({
  graphiql: true,
  schema,
});
