export default Login = (function() {
  const handleLogin = function() {
    $('.login-form').validate({
      errorElement: 'span', // default input error message container
      errorClass: 'help-block', // default input error message class
      focusInvalid: false, // do not focus the last invalid input
      rules: {
        email: {
          required: true,
        },
        password: {
          required: true,
        },
        remember: {
          required: false,
        },
      },

      messages: {
        email: {
          required: 'Email is required.',
        },
        password: {
          required: 'Password is required.',
        },
      },

      invalidHandler(event, validator) { // display error alert on form submit
        $('.alert-danger', $('.login-form')).show();
      },

      highlight(element) { // hightlight error inputs
        $(element)
          .closest('.form-group').addClass('has-error'); // set error class to the control group
      },

      success(label) {
        label.closest('.form-group').removeClass('has-error');
        label.remove();
      },

      errorPlacement(error, element) {
        error.insertAfter(element.closest('.input-icon'));
      },

      submitHandler(form) {
        form.submit(); // form validation success, call ajax form submit
      },
    });

    $('.login-form input').keypress(function(e) {
      if (e.which == 13) {
        if ($('.login-form').validate().form()) {
          $('.login-form').submit(); // form validation success, call ajax form submit
        }
        return false;
      }
    });
  };

  const handleForgetPassword = function() {
    $('.forget-form').validate({
      errorElement: 'span', // default input error message container
      errorClass: 'help-block', // default input error message class
      focusInvalid: false, // do not focus the last invalid input
      ignore: '',
      rules: {
        email: {
          required: true,
          email: true,
        },
      },

      messages: {
        email: {
          required: 'Email is required.',
        },
      },

      invalidHandler(event, validator) { // display error alert on form submit

      },

      highlight(element) { // hightlight error inputs
        $(element)
          .closest('.form-group').addClass('has-error'); // set error class to the control group
      },

      success(label) {
        label.closest('.form-group').removeClass('has-error');
        label.remove();
      },

      errorPlacement(error, element) {
        error.insertAfter(element.closest('.input-icon'));
      },

      submitHandler(form) {
        form.submit();
      },
    });

    $('.forget-form input').keypress(function(e) {
      if (e.which == 13) {
        if ($('.forget-form').validate().form()) {
          $('.forget-form').submit();
        }
        return false;
      }
    });

    jQuery('#forget-password').click(function() {
      jQuery('.login-form').hide();
      jQuery('.forget-form').show();
    });

    jQuery('#back-btn').click(function() {
      jQuery('.login-form').show();
      jQuery('.forget-form').hide();
    });
  };

  const handleRegister = function() {
    $('.register-form').validate({
      errorElement: 'span', // default input error message container
      errorClass: 'help-block', // default input error message class
      focusInvalid: false, // do not focus the last invalid input
      ignore: '',
      rules: {
        firstname: {
          required: true,
        },
        lastname: {
          required: true,
        },
        phone: {
          required: true,
        },
        email: {
          required: true,
          email: true,
        },
        address: {
          required: true,
        },
        city: {
          required: true,
        },
        state: {
          required: true,
        },
        zip: {
          required: true,
        },
        password: {
          required: true,
        },
        rpassword: {
          equalTo: '#register_password',
        },

        tnc: {
          required: true,
        },
      },

      messages: { // custom messages for radio buttons and checkboxes
        tnc: {
          required: 'Please accept terms of service first.',
        },
      },

      invalidHandler(event, validator) { // display error alert on form submit

      },

      highlight(element) { // hightlight error inputs
        $(element)
          .closest('.form-group').addClass('has-error'); // set error class to the control group
      },

      success(label) {
        label.closest('.form-group').removeClass('has-error');
        label.remove();
      },

      errorPlacement(error, element) {
        if (element.attr('name') == 'tnc') { // insert checkbox errors after the container
          error.insertAfter($('#register_tnc_error'));
        } else if (element.closest('.input-icon').size() === 1) {
          error.insertAfter(element.closest('.input-icon'));
        } else {
          error.insertAfter(element);
        }
      },

      submitHandler(form) {
        form[0].submit();
      },
    });

    $('.register-form input').keypress(function(e) {
      if (e.which == 13) {
        if ($('.register-form').validate().form()) {
          $('.register-form').submit();
        }
        return false;
      }
    });
  };

  return {
    // main function to initiate the module
    init() {
      handleLogin();
      handleForgetPassword();
      handleRegister();
    },

  };
}());
