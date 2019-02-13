import { JqueryInputMask } from '/imports/ui/js/jquery.inputmask';
import { bertSuccess } from '../../imports/api/utils';

Template.LoginContent.onRendered(() => {
  $('body').addClass('login');
  import '/imports/ui/stylesheets/login.css';

  $("[name='phone']").inputmask({ mask: '(999) 999-9999' });

  $('.login-form').validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },
    messages: {
      email: {
        required: 'Please enter your email address to login.',
        email: 'Please enter a valid email address.',
      },
      password: {
        required: 'Please enter your password to login.',
      },
    },

    highlight(element) {
      // hightlight error inputs
      $(element)
        .closest('.form-group')
        .addClass('has-error'); // set error class to the control group
    },

    success(label) {
      label.closest('.form-group').removeClass('has-error');
      label.remove();
    },

    errorPlacement(error, element) {
      if (element.attr('name') == 'tnc') {
        // insert checkbox errors after the container
        error.insertAfter($('#register_tnc_error'));
      } else if (element.closest('.input-icon').size() === 1) {
        error.insertAfter(element.closest('.input-icon'));
      } else {
        error.insertAfter(element);
      }
    },
    submitHandler() {
      const email = $('[name="email"]').val();
      const password = $('[name="password"]').val();

      Meteor.loginWithPassword(email, password, (error) => {
        if (error) {
          alert(error.reason);
        } else {
          FlowRouter.go('home');
        }
      });
    },
  });

  // Fill the form fields so we can just submit them
  if (Meteor.isDevelopment) {
    import { fillForms } from '/imports/api/miscFunctions';

    fillForms();
  }
});

Template.LoginContent.events({
  'submit .register-form'(event) {
    event.preventDefault();
    const emailVar = event.target.email.value.trim();
    const passwordVar = event.target.password.value;
    const profile = {
      firstName: event.target.firstname.value.trim(),
      lastName: event.target.lastname.value.trim(),
      phone: event.target.phone.value.trim(),
      address: {
        address: event.target.address.value.trim(),
        city: event.target.city.value.trim(),
        state: event.target.state.value.trim(),
        zip: event.target.zip.value.trim(),
      },
    };
    Accounts.createUser(
      {
        email: emailVar,
        password: passwordVar,
        profile,
      },
      (err) => {
        if (err) console.error(err);
        else FlowRouter.go('home');
      },
    );
  },
  'click #register-btn'() {
    $('.login-form').hide();
    $('.register-form').show();
    // Fill the form fields so we can just submit them
    if (Meteor.isDevelopment) {
      import { fillForms } from '/imports/api/miscFunctions';

      fillForms();
    }
  },
  'click #register-back-btn'() {
    $('.register-form').hide();
    $('.login-form').show();
  },
  'click #back-btn'(event) {
    event.target.form.reset();
    $('.register-form').hide();
    $('.forget-form').hide();
    $('.login-form').show();
  },
  'click #forget-password'(event) {
    event.preventDefault();
    $('.login-form').hide();
    $('.register-form').hide();
    $('.forget-form').show();
  },
  'submit .forget-form'(event) {
    event.preventDefault();
    Accounts.forgotPassword({ email: e.target.email.value }, (err) => {
      if (err) console.error(err);
      else {
        bertSuccess(
          'Email sent',
          'Check your email inbox for the password reset email.',
        );
        FlowRouter.go('login');
      }
    });
  },
});
