Mandrill.config( {
  username: Meteor.settings.Email.mandrillUsername,
  "key":    Meteor.settings.Email.mandrillKey,
  port: 587,
  host: "smtps.mandrillapp.com"
} );