Accounts.config({
  forbidClientAccountCreation: false,
});

// Ensuring every user has an email address, should be in server-side code
Accounts.validateNewUser((user) => {
  new SimpleSchema({
    _id: { type: String },
    emails: { type: Array },
    'emails.$': { type: Object },
    'emails.$.address': { type: String },
    'emails.$.verified': { type: Boolean },
    createdAt: { type: Date },
    services: { type: Object, blackbox: true },
    profile: { type: Object },
    'profile.firstName': { type: String },
    'profile.lastName': { type: String },
    'profile.phone': { type: String },
    'profile.address': { type: Object },
    'profile.address.address': { type: String },
    'profile.address.city': { type: String },
    'profile.address.state': { type: String },
    'profile.address.zip': { type: String },
  }).validate(user);

  // Return true to allow user creation to proceed
  return true;
});

Accounts.emailTemplates.siteName = Meteor.settings.public.orgName;
Accounts.emailTemplates.from = `${Meteor.settings.public.orgName}<${
  Meteor.settings.Email.supportAddress
}>`;

// Configure verifyEmail subject
Accounts.emailTemplates.verifyEmail.subject = function() {
  return 'Verify Your Email Address';
};

// Configures "reset-password account" email link
Accounts.urls.resetPassword = function(token) {
  return Meteor.absoluteUrl(`reset-password/${token}`);
};
Accounts.emailTemplates.resetPassword.subject = function() {
  return 'Reset Your Password.';
};

// Configures "enroll-account" email link
Accounts.urls.enrollAccounts = function(token) {
  return Meteor.absoluteUrl(`enroll-account/${token}`);
};
Accounts.emailTemplates.enrollAccount.subject = function() {
  return 'You have an account.';
};

const mandrillEnrollAccountEmailName = Meteor.settings.Email.enrollmentName;
const mandrillResetPasswordEmailName = Meteor.settings.Email.resetPasswordName;

Accounts.emailTemplates.enrollAccount.html = function(user, url) {
  let data_slug;
  try {
    data_slug = {
      template_name: mandrillEnrollAccountEmailName,
      template_content: [{}],
      message: {
        global_merge_vars: [
          {
            name: 'Enrollment_URL',
            content: url,
          },
          {
            name: 'DEV',
            content: Meteor.settings.dev || '',
          },
        ],
      },
    };

    // The built-in function uses the merge_vars, not the global merge vars,
    // so we need to copy global_merge_vars to the merge_vars
    data_slug.merge_vars = data_slug.message.global_merge_vars;
    const result = Mandrill.templates.render(data_slug);
    return result.data.html;
  } catch (error) {
    console.error('Error while rendering Mandrill template', error);
  }
};

Accounts.emailTemplates.resetPassword.html = function(user, url) {
  let data_slug;
  try {
    data_slug = {
      template_name: mandrillResetPasswordEmailName,
      template_content: [{}],
      message: {
        global_merge_vars: [
          {
            name: 'Enrollment_URL',
            content: url,
          },
          {
            name: 'DEV',
            content: Meteor.settings.dev || '',
          },
        ],
      },
    };

    // The built-in function uses the merge_vars, not the global merge vars,
    // so we need to copy global_merge_vars to the merge_vars
    data_slug.merge_vars = data_slug.message.global_merge_vars;
    const result = Mandrill.templates.render(data_slug);
    return result.data.html;
  } catch (error) {
    console.error('Error while rendering Mandrill template', error);
  }
};
