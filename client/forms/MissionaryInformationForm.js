import '/imports/ui/stylesheets/bootstrap-datepicker3.css';
import  { App } from '/imports/ui/js/app';
import { BootstrapDatePicker } from '/imports/ui/js/bootstrap-datepicker';
import { JqueryInputMask } from '/imports/ui/js/jquery.inputmask';


Template.MissionaryInformationForm.onRendered(()=>{

  $('.date-picker').datepicker({
    autoclose: true
  });
  $("[name='emergencyContactPhone']").inputmask({"mask": "(999) 999-9999"});
  $("[name='lastTetanusShotYear']").inputmask({"mask": "9999"});

  // for more info visit the official plugin documentation:
  // http://docs.jquery.com/Plugins/Validation
  var missionaryInformationForm = $('#missionaryInformationForm');
  var error1 = $('.alert-danger', missionaryInformationForm);
  var success1 = $('.alert-success', missionaryInformationForm);

  missionaryInformationForm.validate({
    errorElement: 'span', //default input error message container
    errorClass: 'help-block help-block-error', // default input error message class
    focusInvalid: false, // do not focus the last invalid input
    ignore: "", // validate all fields including form hidden input
    messages: {
      payment: {
        maxlength: jQuery.validator.format("Max {0} items allowed for selection"),
        minlength: jQuery.validator.format("At least {0} items must be selected")
      },
      'checkboxes1[]': {
        required: 'Please check some options',
        minlength: jQuery.validator.format("At least {0} items must be selected"),
      },
      'checkboxes2[]': {
        required: 'Please check some options',
        minlength: jQuery.validator.format("At least {0} items must be selected"),
      },
    },
    rules: {
      preferredName: {
        minlength: 2,
        required: true
      },
      passportExpirationDate: {
        date: true,
      },
      birthdate: {
        date: true
      },
      lastTetanusShotYear: {
        number: true
      },
      emergencyContactPhone: {
        phoneUS: true
      }
    },

    invalidHandler: function(event, validator) { //display error alert on form submit
      success1.hide();
      error1.show();
      App.scrollTo(error1, -200);
    },

    errorPlacement: function(error, element) {
      if (element.is(':checkbox')) {
        error.insertAfter(element.closest(".md-checkbox-list, .md-checkbox-inline, .checkbox-list, .checkbox-inline"));
      } else if (element.is(':radio')) {
        error.insertAfter(element.closest(".md-radio-list, .md-radio-inline, .radio-list,.radio-inline"));
      } else {
        error.insertAfter(element); // for other inputs, just perform default behavior
      }
    },

    highlight: function(element) { // hightlight error inputs
      $(element)
        .closest('.form-group').addClass('has-error'); // set error class to the control group
    },

    unhighlight: function(element) { // revert the change done by hightlight
      $(element)
        .closest('.form-group').removeClass('has-error'); // set error class to the control group
    },

    success: function(label) {
      label
        .closest('.form-group').removeClass('has-error'); // set success class to the control group
    },

    submitHandler: function(form) {
      success1.show();
      error1.hide();
    }
  });
});

Template.MissionaryInformationForm.events({
  'submit form'(e){
    e.preventDefault();
    console.log('form submitted');
  },
  'change .date-picker'(e){
    let dateValue = $(e.currentTarget).val();
    if (dateValue) $(e.currentTarget).addClass('edited');
  }
});