import { zipcode } from '/imports/api/validationMethods';

Template.UserRegistration.onRendered(()=>{
  zipcode();

  // for more info visit the official plugin documentation:
  // http://docs.jquery.com/Plugins/Validation
  var form = $('#userRegistrationForm');
  var error1 = $('.alert-danger', form);

  form.validate({
    errorElement: 'span', //default input error message container
    errorClass: 'help-block help-block-error', // default input error message class
    focusInvalid: true, // do not focus the last invalid input
    rules: {
      zip:{
        zipcode: true
      }
    },
    messages: {
      zip: {
        zipcode: "That doesn't look like a valid zip code"
      }
    },

    invalidHandler: function(event, validator) { //display error alert on form submit
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
      error1.hide();
      let btn = $('[name="submitUserRegistrationForm"]');
      btn.button("loading");

      let formData = {
        "firstName":  $( "[name='firstName']" ).val(),
        "middleName": $( "[name='middleName']" ).val(),
        "lastName":   $( "[name='lastName']" ).val(),
        "phone":      $( "[name='phone']" ).val(),
        "address":    {
          "address": $( "[name='address']" ).val(),
          "city":    $( "[name='city']" ).val(),
          "state":   $( "[name='state']" ).val(),
          "zip":     $( "[name='zip']" ).val()
        }
      };
      Meteor.users.update({_id: Meteor.userId()}, {$set: {profile: formData}}, (err, affectedDocs)=>{
        if (err) {
          btn.button('error');
          console.error(err);
        } else {
          setTimeout(function () {
            btn.button('success')
          }, 500);
        }
      });

    }
  });

  if(Session.equals("showUserRegistration", true)){
    $("#expand-userRegistrationForm").click();
  }
});

Template.UserRegistration.helpers({
  getStates(){
    const states = [
      { stateAbbr: "", name: ""},
      { stateAbbr: "AL", name: "Alabama"},
      { stateAbbr: "AK", name: "Alaska"},
      { stateAbbr: "AZ", name: "Arizona"},
      { stateAbbr: "AR", name: "Arkansas"},
      { stateAbbr: "CA", name: "California"},
      { stateAbbr: "CO", name: "Colorado"},
      { stateAbbr: "CT", name: "Connecticut"},
      { stateAbbr: "DE", name: "Delaware"},
      { stateAbbr: "DC", name: "District Of Columbia"},
      { stateAbbr: "FL", name: "Florida"},
      { stateAbbr: "GA", name: "Georgia"},
      { stateAbbr: "HI", name: "Hawaii"},
      { stateAbbr: "ID", name: "Idaho"},
      { stateAbbr: "IL", name: "Illinois"},
      { stateAbbr: "IN", name: "Indiana"},
      { stateAbbr: "IA", name: "Iowa"},
      { stateAbbr: "KS", name: "Kansas"},
      { stateAbbr: "KY", name: "Kentucky"},
      { stateAbbr: "LA", name: "Louisiana"},
      { stateAbbr: "ME", name: "Maine"},
      { stateAbbr: "MD", name: "Maryland"},
      { stateAbbr: "MA", name: "Massachusetts"},
      { stateAbbr: "MI", name: "Michigan"},
      { stateAbbr: "MN", name: "Minnesota"},
      { stateAbbr: "MS", name: "Mississippi"},
      { stateAbbr: "MO", name: "Missouri"},
      { stateAbbr: "MT", name: "Montana"},
      { stateAbbr: "NE", name: "Nebraska"},
      { stateAbbr: "NV", name: "Nevada"},
      { stateAbbr: "NH", name: "New Hampshire"},
      { stateAbbr: "NJ", name: "New Jersey"},
      { stateAbbr: "NM", name: "New Mexico"},
      { stateAbbr: "NY", name: "New York"},
      { stateAbbr: "NC", name: "North Carolina"},
      { stateAbbr: "ND", name: "North Dakota"},
      { stateAbbr: "OH", name: "Ohio"},
      { stateAbbr: "OK", name: "Oklahoma"},
      { stateAbbr: "OR", name: "Oregon"},
      { stateAbbr: "PA", name: "Pennsylvania"},
      { stateAbbr: "RI", name: "Rhode Island"},
      { stateAbbr: "SC", name: "South Carolina"},
      { stateAbbr: "SD", name: "South Dakota"},
      { stateAbbr: "TN", name: "Tennessee"},
      { stateAbbr: "TX", name: "Texas"},
      { stateAbbr: "UT", name: "Utah"},
      { stateAbbr: "VT", name: "Vermont"},
      { stateAbbr: "VA", name: "Virginia"},
      { stateAbbr: "WA", name: "Washington"},
      { stateAbbr: "WV", name: "West Virginia"},
      { stateAbbr: "WI", name: "Wisconsin"},
      { stateAbbr: "WY", name: "Wyoming"}
    ];
    const state = this && this.profile && this.profile.address && this.profile.address.state;
    states.map(function (thisState) {
      if(thisState.stateAbbr === state){
        thisState.selected = "selected";
      }
      return thisState;
    });
    return states;
  }
});

Template.UserRegistration.events({
  'click #expand-userRegistrationForm'(){
    $("[name='phone']").inputmask({"mask": "(999) 999-9999"});
  }
});

Template.UserRegistration.onDestroyed(function () {
  Session.delete("showingUserId");
});