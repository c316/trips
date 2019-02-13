import '/imports/ui/stylesheets/bootstrap-datepicker3.css';
import 'jquery-validation';
import { BootstrapDatePicker } from '/imports/ui/js/bootstrap-datepicker';
import { JqueryInputMask } from '/imports/ui/js/jquery.inputmask';
import { phoneUS, zipcode } from '/imports/api/validationMethods';
import { bertSuccess } from '../../imports/api/utils';

Template.MissionaryInformationForm.onRendered(function() {
  phoneUS();
  zipcode();

  $('.date-picker').datepicker({
    autoclose: true,
    startView: 'decade',
  });
  $("[name='emergencyContactPhone']").inputmask({ mask: '(999) 999-9999' });
  $("[name='lastTetanusShotYear']").inputmask({ mask: '9999' });

  // for more info visit the official plugin documentation:
  // http://docs.jquery.com/Plugins/Validation
  const missionaryInformationFormVar = $('#missionaryInformationForm');
  const error1 = $('.alert-danger', missionaryInformationFormVar);
  const success1 = $('.alert-success', missionaryInformationFormVar);

  missionaryInformationFormVar.validate({
    errorElement: 'span', // default input error message container
    errorClass: 'help-block help-block-error', // default input error message class
    focusInvalid: false,
    ignore: [],
    rules: {
      preferredName: {
        required: true,
        minlength: 2,
      },
      passportStatus: {
        required: true,
      },
      passportExpirationDate: {
        required() {
          if ($("input:radio[name='passportStatus']").is(':checked')) {
            if ($('input[name="passportStatus"]:checked').val() === 'yes') {
              return true;
            }
          }
          return false;
        },
      },
      birthdate: {
        required: true,
        date: true,
      },
      gender: {
        required: true,
      },
      emergencyContactFullName: {
        required: true,
      },
      emergencyContactAddressLine1: {
        required: true,
      },
      emergencyContactCity: {
        required: true,
      },
      emergencyContactState: {
        required: true,
      },
      emergencyContactAddressZip: {
        zipcode: true,
        required: true,
      },
      emergencyContactPhone: {
        phoneUS: true,
        required: true,
      },
      beneficiaryFullName: {
        required: true,
      },
      beneficiaryRelationship: {
        required: true,
      },
      homeChurchName: {
        required: true,
      },
      bloodType: {
        required: true,
      },
      tShirtSize: {
        required: true,
      },
      lastTetanusShotYear: {
        number: true,
        required: true,
      },
      convictedOfACrime: {
        required: true,
      },
      permissionToRunBackgroundCheck: {
        required: true,
      },
      speaksOtherLanguages: {
        required: true,
      },
      beenOnATMPTrip: {
        required: true,
      },
      traveledOutsideTheUS: {
        required: true,
      },
      whyDoYouWantToJoinThisTeam: {
        required: true,
      },
      whatThreeSkills: {
        required: true,
      },
      iWouldLikeToParticipateIn: {
        required: true,
      },
      opportunityDetails: {
        required: true,
      },
      iagree: {
        required: true,
      },
    },
    messages: {
      preferredName: 'Please specify your name',
      emergencyContactAddressZip: {
        minlength: 'Your zip code needs to be at least 5 digits long',
      },
    },

    invalidHandler() {
      // display error alert on form submit
      success1.hide();
      error1.show();
    },

    errorPlacement(error, element) {
      if (element.is(':checkbox')) {
        error.insertAfter(element.closest('.md-checkbox-list, .md-checkbox-inline, .checkbox-list, .checkbox-inline'));
      } else if (element.is(':radio')) {
        error.insertAfter(element.closest('.md-radio-list, .md-radio-inline, .radio-list,.radio-inline'));
      } else {
        error.insertAfter(element); // for other inputs, just perform default behavior
      }
    },

    highlight(element) {
      // highlight error inputs
      $(element)
        .closest('.form-group')
        .addClass('has-error'); // set error class to the control group
    },

    unhighlight(element) {
      // revert the change done by highlight
      $(element)
        .closest('.form-group')
        .removeClass('has-error'); // set error class to the control group
    },

    success(label) {
      label.closest('.form-group').removeClass('has-error'); // set success class to the control group
    },
  });

  // Show the explain box if they have a criminal past
  if ($('input[name="convictedOfACrime"]:checked').val() === 'yes') {
    $('#convictedOfACrimeExplainedDiv').show();
  }

  // Show the explain box if they have traveled outside the US
  if ($('input[name="traveledOutsideTheUS"]:checked').val() === 'yes') {
    $('#outsideUSTravelExplainedDiv').show();
  }

  // Show the explain box if they have traveled with TMP before
  if ($('input[name="beenOnATMPTrip"]:checked').val() === 'yes') {
    $('#beenOnATMPTripExplainedDiv').show();
  }

  // Show the explain box if they do speak other languages
  if ($('input[name="speaksOtherLanguages"]:checked').val() === 'yes') {
    $('#languageProficiencyExplainedExplainedDiv').show();
  }
});

Template.MissionaryInformationForm.helpers({
  missionaryInformation() {
    const thisForm = Forms.findOne({
      name: 'missionaryInformationForm',
      userId: this._id,
    });
    return thisForm || {};
  },
});

Template.MissionaryInformationForm.events({
  'change .date-picker'(event) {
    const dateValue = $(event.currentTarget).val();
    if (dateValue) $(event.currentTarget).addClass('edited');
  },
  'change #missionaryInformationForm'(event, tmpl) {
    // check to see if the trip leader is looking at the form to verify it, if so, then
    // exit this change function
    if (Session.get('verifying')) {
      return;
    }
    // This will be called several times when the form renders, make sure
    // you check to see if the value being passed is empty
    // Then check that if is is empty that is was empty in the document
    // if it wasn't empty in the document then that means the user
    // deleted the value here and we should then update to the new blank value
    if (!event.target.value) {
      const thisForm = Forms.findOne({ _id: this._id });
      if (!thisForm) return;
      const oldValue = thisForm[event.target.name];
      if (!oldValue) {
        return;
      }
    }

    // Validate that the form has all the required fields
    $('#missionaryInformationForm').valid();

    // Get all the form data, convert it to an object and for the array of
    // checkboxes called, 'iWouldLikeToParticipateIn' push them into one key,
    // otherwise this value will be overwritten and you'll only get the last value
    // inserted into the document
    const form = {};
    const iWouldLikeToParticipateIn = [];
    $('#missionaryInformationForm')
      .serializeArray()
      .map(function(x) {
        if (x.value) {
          if (x.name === 'iWouldLikeToParticipateIn') {
            iWouldLikeToParticipateIn.push(x.value);
          } else {
            form[x.name] = x.value;
          }
        }
      });
    form.iWouldLikeToParticipateIn = iWouldLikeToParticipateIn;
    form.name = 'missionaryInformationForm';
    form.verified = !!form.verified;
    if (form.verified) {
      form.verifiedDate = new Date(form.verifiedDate);
    }

    const updateThisId = tmpl && tmpl.data._id;
    Meteor.call('update.form', form, updateThisId, function(err) {
      if (err) console.error(err);
    });
  },
  'change [name="passportStatus"]'() {
    if ($('input[name="passportStatus"]:checked').val() === 'yes') {
      $('#passportExpirationDateDiv').show();
    } else {
      bertSuccess('Please enter your passport information and upload a color photocopy of your passport as soon as you get it.');
      $('#passportExpirationDateDiv').hide();
      $('[name="passportExpirationDate"]').val('');
    }
  },
  'change [name="convictedOfACrime"]'() {
    if ($('input[name="convictedOfACrime"]:checked').val() === 'yes') {
      $('#convictedOfACrimeExplainedDiv').show();
    } else {
      $('#convictedOfACrimeExplainedDiv').hide();
      $('[name="convictedOfACrimeExplained"]').val('');
    }
  },
  'change [name="speaksOtherLanguages"]'() {
    if ($('input[name="speaksOtherLanguages"]:checked').val() === 'yes') {
      $('#languageProficiencyExplainedExplainedDiv').show();
    } else {
      $('#languageProficiencyExplainedExplainedDiv').hide();
      $('[name="languageProficiencyExplained"]').val('');
    }
  },
  'change [name="beenOnATMPTrip"]'() {
    if ($('input[name="beenOnATMPTrip"]:checked').val() === 'yes') {
      $('#beenOnATMPTripExplainedDiv').show();
    } else {
      $('#beenOnATMPTripExplainedDiv').hide();
      $('[name="beenOnATMPTripExplained"]').val('');
    }
  },
  'change [name="traveledOutsideTheUS"]'() {
    if ($('input[name="traveledOutsideTheUS"]:checked').val() === 'yes') {
      $('#outsideUSTravelExplainedDiv').show();
    } else {
      $('#outsideUSTravelExplainedDiv').hide();
      $('[name="outsideUSTravelExplained"]').val('');
    }
  },
});
