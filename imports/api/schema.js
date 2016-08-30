import rp from 'request-promise';

export const schema = [`
type Query {
  dtFundId: Int
}

schema {
  query: Query
}
`];

export const resolvers = {
  Query: {
    dtFundId(){
      const data = rp('https://trashmountain.donortools.com/funds.json', {
        'auth': {
          "user": Meteor.settings.DT.user,
          "pass": Meteor.settings.DT.pass,
        }
      })
        .then((res) => JSON.parse(res))
        .then((res) => {
          console.log(res[0].fund);
          return res[0].fund.id;
        });
      return data;
    }
  }
};
