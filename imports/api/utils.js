/**
 * DDP connection method for connecting to the give app
 *
 * @method connectToGive
 */
export const connectToGive = () =>{
  logger.info( "Started DDP connection using connectToGive" );
  let connection = DDP.connect(Meteor.settings.Give.URL);
  connection.call('login', {
    "password": Meteor.settings.Give.tripsManagerPassword,
    "user": {
      "email": Meteor.settings.Give.tripsManagerEmail
    }
  });
  return connection;
};

/**
 * General purpose http getter
 * cRud (R in CRUD)
 * http://docs.meteor.com/#/full/http_call
 *
 * @method http_get_donortools
 * @param {String} getQuery - The query string that should be attached to this request
 */
export const http_get_donortools = ( getQuery )=>{
  const DTBaseURL = Meteor.settings.DT.baseURL;

  logger.info( "Started http_get_donortools" );
  logger.info( "getQuery:", getQuery );

  if( DTBaseURL && getQuery) {
    logger.info("Donor Tools URL to use in get:", DTBaseURL);
    try {
      let getResource = HTTP.get( DTBaseURL + getQuery, {
        auth: Meteor.settings.DT.user + ":" + Meteor.settings.DT.pass
      } );
      return getResource;
    } catch( e ) {
      // The statusCode should show us if there was a connection problem or network error
      throw new Meteor.Error( e.statusCode, e );
    }
  } else {
    console.error( 'No DonorTools url setup' );
    throw new Meteor.Error( 400, 'No DonorTools url setup' );
  }
};

const _Splits = ( fundId )=>{
  logger.info(fundId);
  let newValue = [];
  const getQuery = 'funds/' + fundId + '/splits.json';

  const data = http_get_donortools(getQuery);

  data.data.forEach( function ( donationSplit ) {
    newValue.push( donationSplit.split );
  } );
  return newValue;
};

const _Donation = ( splitId )=>{
  const getQuery = 'donations/' + splitId + '.json';

  const data = http_get_donortools(getQuery);
  logger.info("_Donation result:");
  return data.data.donation;
};

const _Person = ( persona_id )=>{
  logger.info(persona_id);
  const getQuery = 'people/' + persona_id + '.json';

  const data = http_get_donortools(getQuery);
  return data.data.persona;
};

export const getDTSplitData = ( fundId )=>{
  let allData = _Splits(fundId);
  allData.map((split)=> {
    logger.info( "split.id: ", split.id );
    split.donation = _Donation( split.donation_id );
    split.persona = _Person( split.donation.persona_id );
    return split;
  });
  logger.info(allData);
  allData.forEach((split)=>{
    DTSplits.upsert({_id: split.id}, split);
  });
  return allData;
};

/**
 * Get the Donor Tools split data and expand that to include the donation
 * and person objects
 *
 * @method updateSplits
 */
export const updateSplits = () =>{
  logger.info("Started updateSplits");
  const activeTrips = Trips.find({expires: {$gte: new Date()}});
  activeTrips.forEach(function ( trip ) {
    // Get and store the combined split data
    const splitData = getDTSplitData( trip.tripId );
  });
  return 'success';
};
