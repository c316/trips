Template.LoginContent.onRendered(()=>{
  $('body').addClass('login');
  import '/imports/ui/stylesheets/login.css';
  //import Login from  '/imports/ui/js/login';

  //Login.init();


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
      let email    = $( '[name="email"]' ).val(),
        password = $('[name="password"]').val();

      Meteor.loginWithPassword( email, password, ( error ) => {
        if ( error ) {
          alert( error.reason );
        }
      });
    }});

  // Fill the form fields so we can just submit them
  if (Meteor.isDevelopment) {
    import { fillForms } from '/imports/api/miscFunctions';
  }
  fillForms();
});

Template.LoginContent.events({
  'submit form'(){
    console.log('Form submitted');
  },
  'click #register-btn'() {
    $('.login-form').hide();
    $('.register-form').show();
    // Fill the form fields so we can just submit them
    if (Meteor.isDevelopment) {
      import { fillForms } from '/imports/api/miscFunctions';
    }
    fillForms();
  },
  'click #register-back-btn'(){
    $( '.login-form' ).show();
    $( '.register-form' ).hide();
  }
});