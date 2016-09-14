Accounts.config({
  forbidClientAccountCreation : false
});

// Ensuring every user has an email address, should be in server-side code
Accounts.validateNewUser( ( user ) => {
  new SimpleSchema( {
    _id:                       { type: String },
    emails:                    { type: Array },
    'emails.$':                { type: Object },
    'emails.$.address':        { type: String },
    'emails.$.verified':       { type: Boolean },
    createdAt:                 { type: Date },
    services:                  { type: Object, blackbox: true },
    profile:                   { type: Object },
    'profile.firstName':       { type: String },
    'profile.lastName':        { type: String },
    'profile.phone':           { type: String },
    'profile.address':         { type: Object },
    'profile.address.address': { type: String },
    'profile.address.city':    { type: String },
    'profile.address.state':   { type: String },
    'profile.address.zip':     { type: String },
  } ).validate( user );

  // Return true to allow user creation to proceed
  return true;
});