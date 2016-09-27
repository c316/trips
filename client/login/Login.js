import { JqueryInputMask } from '/imports/ui/js/jquery.inputmask';

Template.LoginContent.onRendered(()=>{
  $('body').addClass('login');
  import '/imports/ui/stylesheets/login.css';
  $("[name='phone']").inputmask({"mask": "(999) 999-9999"});


  $( '.login-form' ).validate({
    rules:{
      email: {
        required: true,
        email: true
      },
      password: {
        required: true
      }
    },
    messages: {
      email: {
        required: "Please enter your email address to login.",
        email: "Please enter a valid email address."
      },
      password: {
        required: "Please enter your password to login."
      }
    },

    invalidHandler: function(event, validator) { //display error alert on form submit

    },

    highlight: function(element) { // hightlight error inputs
      $(element)
        .closest('.form-group').addClass('has-error'); // set error class to the control group
    },

    success: function(label) {
      label.closest('.form-group').removeClass('has-error');
      label.remove();
    },

    errorPlacement: function(error, element) {
      if (element.attr("name") == "tnc") { // insert checkbox errors after the container
        error.insertAfter($('#register_tnc_error'));
      } else if (element.closest('.input-icon').size() === 1) {
        error.insertAfter(element.closest('.input-icon'));
      } else {
        error.insertAfter(element);
      }
    },
    submitHandler() {
      let email     = $('[name="email"]').val(),
        password    = $('[name="password"]').val();

      Meteor.loginWithPassword( email, password, ( error ) => {
        if ( error ) {
          alert( error.reason );
        } else {
          FlowRouter.go("home");
        }
      });
    }});

  // Fill the form fields so we can just submit them
  if (Meteor.isDevelopment) {
    import { fillForms } from '/imports/api/miscFunctions';
    fillForms();
  }
});

Template.LoginContent.events({
  'submit .register-form'(e){
    e.preventDefault();
    const emailVar = e.target.email.value;
    const passwordVar = e.target.password.value;
    const profile = {
      firstName: e.target.firstname.value,
      lastName: e.target.lastname.value,
      phone: e.target.phone.value,
      address: {
        address: e.target.address.value,
        city: e.target.city.value,
        state: e.target.state.value,
        zip: e.target.zip.value,
      },
    };
    Accounts.createUser({
      email: emailVar,
      password: passwordVar,
      profile
    }, (e)=>{
      if (e) console.error(e);
      else FlowRouter.go('home');
    });
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
  'click #register-back-btn'(){
    $( '.register-form' ).hide();
    $( '.login-form' ).show();
  },
  'click #back-btn'(e){
    e.target.form.reset();
    $( '.register-form' ).hide();
    $( '.forget-form' ).hide();
    $( '.login-form' ).show();
  },
  'click #forget-password'(e){
    e.preventDefault();
    $( '.login-form' ).hide();
    $( '.register-form' ).hide();
    $( '.forget-form' ).show();
  },
  'submit .forget-form'(e){
    e.preventDefault();
    Accounts.forgotPassword({email: e.target.email.value}, ( err )=> {
      if(err) console.error(err);
      else {
        Bert.alert({
          title: 'Email sent',
          message: 'Check your email inbox for the password reset email.',
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-up'
        });
        FlowRouter.go('login');
      }
    });
  }
});

