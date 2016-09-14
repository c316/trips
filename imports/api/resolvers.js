import rp from 'request-promise';

const DTBaseURL = 'https://trashmountain.donortools.com/';
const getFromDT = (getQuery) => {
  const data = rp( DTBaseURL + getQuery, {
    'auth': {
      "user": Meteor.settings.DT.user,
      "pass": Meteor.settings.DT.pass,
    }
  } )
    .then( ( res ) => JSON.parse( res ) )
    .then((res) =>{
      return res;
    });
  return data;
};



export const resolvers = {
  RootQuery: {
    Splits( root, args, context ){
      let newValue = [];
      const getQuery = 'funds/' + args.id + '/splits.json';

      const data = getFromDT(getQuery)
        .then( ( res ) => {
          res.forEach( function ( donationSplit ) {
            newValue.push( donationSplit.split );
          } );
          return newValue;
        } );

      return data;
    },
  },
  Splits: {
    donation( split ){
      const getQuery = 'donations/' + split.donation_id + '.json';

      const data = getFromDT(getQuery)
        .then((res) => {
          return res.donation;
        });
      return data;
    },
  },
  Donation:{
    person( donation ){
      console.log(donation.persona_id);
      const getQuery = 'people/' + donation.persona_id + '.json';

      const data = getFromDT(getQuery)
        .then((res) => {
          console.log(res.persona);
          return res.persona;
        });
      return data;
    }
  },
  Person:{
    names(person){
      return person.names;
    },
    addresses(person){
      return person.addresses;
    },
    phone_numbers(person){
      return person.phone_numbers;
    },
    email_addresses(person){
      return person.email_addresses;
    }
  }
};
