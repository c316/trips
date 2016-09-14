/**
 * General purpose http gettter
 * cRud (R in CRUD)
 * http://docs.meteor.com/#/full/http_call
 *
 * @method _http_get_donortools
 * @param {String} getQuery - The query string that should be attached to this request
 */
_http_get_donortools = ( getQuery )=>{
  const DTBaseURL = Meteor.settings.DT.baseURL;

  console.log( "Started _http_get_donortools" );
  console.log( "getQuery:", getQuery );


  if( DTBaseURL && getQuery) {
    console.log("Donor Tools URL to use in get:", DTBaseURL);
    /*try {*/
      let getResource = HTTP.get( DTBaseURL + getQuery, {
        auth: Meteor.settings.DT.user + ":" + Meteor.settings.DT.pass
      } );
      return getResource;
    /*} catch( e ) {
      // The statusCode should show us if there was a connection problem or network error
      throw new Meteor.Error( e.statusCode, e );
    }*/
  } else {
    console.error( 'No DonorTools url setup' );
    throw new Meteor.Error( 400, 'No DonorTools url setup' );
  }
};

const _Splits = ( fundId )=>{
  console.log(fundId);
  let newValue = [];
  const getQuery = 'funds/' + fundId + '/splits.json';

  const data = _http_get_donortools(getQuery);
  console.log(data);

  data.data.forEach( function ( donationSplit ) {
    newValue.push( donationSplit.split );
  } );
  return newValue;
};

const _Donation = ( splitId )=>{
  const getQuery = 'donations/' + splitId + '.json';

  const data = _http_get_donortools(getQuery);
  console.log("_Donation result:");
  console.log(data.data);
  return data.data.donation;
};


const _Person = ( persona_id )=>{
  console.log(persona_id);
  const getQuery = 'people/' + persona_id + '.json';

  const data = _http_get_donortools(getQuery);
  return data.data.persona;
};

export const getDTSplitData = ( fundId )=>{
  let allData = _Splits(fundId);
  allData.map((split)=> {
    console.log( "split map ", split );
    split.donation = _Donation( split.donation_id );
    split.persona = _Person( split.donation.persona_id );
    return split;
  });
  console.log(allData);
  allData.forEach((split)=>{
    DTSplits.upsert({_id: split.id}, split);
  });
  return allData;
};