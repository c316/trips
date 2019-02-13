import { bertSuccess } from '../../imports/api/utils';

Template.ResetPassword.onRendered(function() {
  $('body').addClass('login');
  import '/imports/ui/stylesheets/login.css';

  $('#reset-password-form').validate({
    rules: {
      password: {
        minlength: 5,
      },
      rpassword: {
        minlength: 5,
        equalTo: '#reset_password',
      },
    },
  });
});

Template.ResetPassword.events({
  'submit #reset-password-form'(event) {
    event.preventDefault();
    const tokenVar = FlowRouter.getParam('token');
    const newPasswordVar = event.target.password.value;
    Accounts.resetPassword(tokenVar, newPasswordVar, (err) => {
      if (err) console.error(err);
      else {
        bertSuccess('Reset successful', 'Your password has been changed');
        FlowRouter.go('home');
      }
    });
  },
});
