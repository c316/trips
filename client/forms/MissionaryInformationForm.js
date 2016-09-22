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

Template.MissionaryInformationForm.helpers({
  missionaryInformation(){
    let thisForm = Forms.findOne({formName: 'missionaryInformationForm', userId: this._id});
    return thisForm || {};
  },
});

Template.MissionaryInformationForm.events({
  'change .date-picker'(e){
    let dateValue = $(e.currentTarget).val();
    if (dateValue) $(e.currentTarget).addClass('edited');
  },
  'change #missionaryInformationForm'(e, tmpl){
    console.log(e.target.name);
    // This will be called several times when the form renders, make sure
    // you check to see if the value being passed is empty
    // Then check that if is is empty that is was empty in the document
    // if it wasn't empty in the document then that means the user
    // deleted the value here and we should then update to the new blank value
    if(!e.target.value){
      let thisForm = Forms.findOne({_id: this._id});
      if(!thisForm) return;
      let oldValue = thisForm[e.target.name];
      if(!oldValue) {
        return;
      }
    }

    // Validate that the form has all the required fields
    $(e.target).valid();

    // Get all the form data, convert it to an object and for the array of
    // checkboxes called, 'iWouldLikeToParticipateIn' push them into one key,
    // otherwise this value will be overwritten and you'll only get the last value
    // inserted into the document
    let form = {};
    let iWouldLikeToParticipateIn = [];
    $("#missionaryInformationForm").serializeArray().map(function(x){
      if(x.value) {
        if(x.name === 'iWouldLikeToParticipateIn'){
          iWouldLikeToParticipateIn.push(x.value);
        } else {
          form[x.name] = x.value;
        }
      }
    });
    form.iWouldLikeToParticipateIn = iWouldLikeToParticipateIn;
    form.formName = 'missionaryInformationForm';

    let updateThisId = tmpl && tmpl.data._id;
    // TODO: need a way of knowing if the form is completed.
    // If it is then we need to pass the completed: true, or even better do this on the server side

    Meteor.call("update.form", form, updateThisId, function(err, res){
      if(err) console.error(err);
      else console.log(res);
    });

  }
});