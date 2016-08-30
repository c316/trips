import rp from 'request-promise';

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
    },
    dtFundDonations(root, args, context){
      console.log(args.id);
      let newValue = [];

      const data = rp('https://trashmountain.donortools.com/funds/' + args.id + '/splits.json?basis=cash&page=1&per_page=1000&range=all_dates', {
        'auth': {
          "user": Meteor.settings.DT.user,
          "pass": Meteor.settings.DT.pass,
        }
      })
        .then((res) => JSON.parse(res))
        .then((res) => {
          res.forEach(function(donationSplit){
            newValue.push({
              amount: donationSplit.split.amount_in_cents,
              donationId: donationSplit.split.donation_id,
            });
          });
          return newValue;
        });

      const modifiedData = data.map(function ( split ) {
        const donation = rp('https://trashmountain.donortools.com/donations/' + split.donation_id + '.json', {
          'auth': {
            "user": Meteor.settings.DT.user,
            "pass": Meteor.settings.DT.pass,
          }
        })
          .then((res) => JSON.parse(res))
          .then((res) => {
            console.log(res.donation.persona_id);
            return res;
          });
        return {persona_id: donation.donation.persona_id}
      });

      return modifiedData;
    }
  }
};