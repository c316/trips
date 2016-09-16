import '/imports/ui/stylesheets/bootstrap-datepicker3.css';
import { BootstrapDatePicker } from '/imports/ui/js/bootstrap-datepicker';
import { JqueryInputMask } from '/imports/ui/js/jquery.inputmask';
import { phoneUS, zipcode } from '/imports/api/validationMethods';


Template.MissionaryInformationForm.onRendered(()=>{
  phoneUS();
  zipcode();

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
    focusInvalid: true, // do not focus the last invalid input
    rules: {
      preferredName: {
        required: true,
        minlength: 2
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
      },
      emergencyContactAddressZip: {
        zipcode: true
      }
    },
    messages: {
      preferredName: "Please specify your name",
      emergencyContactAddressZip: {
        minlength: "Your zip code needs to be at least 5 digits long"
      }
    },

    invalidHandler: function(event, validator) { //display error alert on form submit
      success1.hide();
      error1.show();
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
      let btn = $('[name="submitMissionaryInformationForm"]');
      btn.button("loading");

      success1.show();
      error1.hide();

      setTimeout(function () {
        btn.button('success')
      }, 500);
    }
  });
});

Template.MissionaryInformationForm.events({
  'change .date-picker'(e){
    let dateValue = $(e.currentTarget).val();
    if (dateValue) $(e.currentTarget).addClass('edited');
  }
});