import { createApolloServer } from 'meteor/apollo';
import { schema } from '/imports/api/schema';
import resolvers from '/imports/api/resolvers';
const logger = { log: (e) => console.log(e) };

createApolloServer({
  graphiql: true,
  pretty: true,
  schema,
  resolvers,
  logger
});
