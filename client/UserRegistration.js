import { zipcode } from '/imports/api/validationMethods';

Template.UserRegistration.onRendered(function() {
  zipcode();

  // for more info visit the official plugin documentation:
  // http://docs.jquery.com/Plugins/Validation
  const form = $('#userRegistrationForm');
  const error1 = $('.alert-danger', form);

  form.validate({
    errorElement: 'span', // default input error message container
    errorClass: 'help-block help-block-error', // default input error message class
    focusInvalid: true, // do not focus the last invalid input
    rules: {
      zip: {
        zipcode: true,
      },
    },
    messages: {
      zip: {
        zipcode: "That doesn't look like a valid zip code",
      },
    },

    invalidHandler(event, validator) {
      // display error alert on form submit
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
      // hightlight error inputs
      $(element)
        .closest('.form-group')
        .addClass('has-error'); // set error class to the control group
    },

    unhighlight(element) {
      // revert the change done by hightlight
      $(element)
        .closest('.form-group')
        .removeClass('has-error'); // set error class to the control group
    },

    success(label) {
      label.closest('.form-group').removeClass('has-error'); // set success class to the control group
    },

    submitHandler(form) {
      error1.hide();
      const btn = $('[name="submitUserRegistrationForm"]');
      btn.button('loading');

      const formData = {
        firstName: $("[name='firstName']")
          .val()
          .trim(),
        lastName: $("[name='lastName']")
          .val()
          .trim(),
        phone: $("[name='phone']")
          .val()
          .trim(),
        address: {
          address: $("[name='address']")
            .val()
            .trim(),
          city: $("[name='city']")
            .val()
            .trim(),
          state: $("[name='state']")
            .val()
            .trim(),
          zip: $("[name='zip']")
            .val()
            .trim(),
        },
      };
      if (Session.get('showingUserId')) {
        Meteor.users.update(
          { _id: Session.get('showingUserId') },
          { $set: { profile: formData } },
          (err, affectedDocs) => {
            if (err) {
              btn.button('error');
              console.error(err);
            } else {
              setTimeout(function() {
                btn.button('success');
                // TODO: call a method to update the name changes in Give
                Meteor.call(
                  'runGiveMethod',
                  'updateFundraiserName',
                  {
                    fname: formData.firstName,
                    lname: formData.lastName,
                    email: Meteor.users.findOne({
                      _id: Session.get('showingUserId'),
                    }).emails[0].address,
                  },
                  function(err, res) {
                    if (err) {
                      console.error(err);
                    } else {
                      console.log(res);
                    }
                  },
                );
              }, 500);
            }
          },
        );
      } else {
        Meteor.call('updateUserDoc', formData, function(err, res) {
          if (err) {
            btn.button('error');
            console.error(err);
          } else {
            setTimeout(function() {
              btn.button('success');
              Meteor.call(
                'runGiveMethod',
                'updateFundraiserName',
                {
                  fname: formData.firstName,
                  lname: formData.lastName,
                  email: Meteor.user().emails[0].address,
                },
                function(err, res) {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log(res);
                  }
                },
              );
            }, 500);
          }
        });
      }
    },
  });

  if (Session.equals('showUserRegistration', true)) {
    $('#expand-userRegistrationForm').click();
    $('html, body').animate(
      {
        scrollTop: $('#userRegistrationForm').offset().top - 170,
      },
      1000,
    );
  }
});

Template.UserRegistration.helpers({
  getStates() {
    const states = [
      { stateAbbr: '', name: '' },
      { stateAbbr: 'AL', name: 'Alabama' },
      { stateAbbr: 'AK', name: 'Alaska' },
      { stateAbbr: 'AZ', name: 'Arizona' },
      { stateAbbr: 'AR', name: 'Arkansas' },
      { stateAbbr: 'CA', name: 'California' },
      { stateAbbr: 'CO', name: 'Colorado' },
      { stateAbbr: 'CT', name: 'Connecticut' },
      { stateAbbr: 'DE', name: 'Delaware' },
      { stateAbbr: 'DC', name: 'District Of Columbia' },
      { stateAbbr: 'FL', name: 'Florida' },
      { stateAbbr: 'GA', name: 'Georgia' },
      { stateAbbr: 'HI', name: 'Hawaii' },
      { stateAbbr: 'ID', name: 'Idaho' },
      { stateAbbr: 'IL', name: 'Illinois' },
      { stateAbbr: 'IN', name: 'Indiana' },
      { stateAbbr: 'IA', name: 'Iowa' },
      { stateAbbr: 'KS', name: 'Kansas' },
      { stateAbbr: 'KY', name: 'Kentucky' },
      { stateAbbr: 'LA', name: 'Louisiana' },
      { stateAbbr: 'ME', name: 'Maine' },
      { stateAbbr: 'MD', name: 'Maryland' },
      { stateAbbr: 'MA', name: 'Massachusetts' },
      { stateAbbr: 'MI', name: 'Michigan' },
      { stateAbbr: 'MN', name: 'Minnesota' },
      { stateAbbr: 'MS', name: 'Mississippi' },
      { stateAbbr: 'MO', name: 'Missouri' },
      { stateAbbr: 'MT', name: 'Montana' },
      { stateAbbr: 'NE', name: 'Nebraska' },
      { stateAbbr: 'NV', name: 'Nevada' },
      { stateAbbr: 'NH', name: 'New Hampshire' },
      { stateAbbr: 'NJ', name: 'New Jersey' },
      { stateAbbr: 'NM', name: 'New Mexico' },
      { stateAbbr: 'NY', name: 'New York' },
      { stateAbbr: 'NC', name: 'North Carolina' },
      { stateAbbr: 'ND', name: 'North Dakota' },
      { stateAbbr: 'OH', name: 'Ohio' },
      { stateAbbr: 'OK', name: 'Oklahoma' },
      { stateAbbr: 'OR', name: 'Oregon' },
      { stateAbbr: 'PA', name: 'Pennsylvania' },
      { stateAbbr: 'RI', name: 'Rhode Island' },
      { stateAbbr: 'SC', name: 'South Carolina' },
      { stateAbbr: 'SD', name: 'South Dakota' },
      { stateAbbr: 'TN', name: 'Tennessee' },
      { stateAbbr: 'TX', name: 'Texas' },
      { stateAbbr: 'UT', name: 'Utah' },
      { stateAbbr: 'VT', name: 'Vermont' },
      { stateAbbr: 'VA', name: 'Virginia' },
      { stateAbbr: 'WA', name: 'Washington' },
      { stateAbbr: 'WV', name: 'West Virginia' },
      { stateAbbr: 'WI', name: 'Wisconsin' },
      { stateAbbr: 'WY', name: 'Wyoming' },
    ];
    let state;
    if (Session.get('showingOtherUser')) {
      const user = Meteor.users.findOne({ _id: Session.get('showingUserId') });
      state =
        user &&
        user.profile &&
        user.profile.address &&
        user.profile.address.state;
    } else {
      state =
        this &&
        this.profile &&
        this.profile.address &&
        this.profile.address.state;
    }
    states.map(function(thisState) {
      if (thisState.stateAbbr === state) {
        thisState.selected = 'selected';
      }
      return thisState;
    });
    return states;
  },
});

Template.UserRegistration.events({
  'click #expand-userRegistrationForm'() {
    $("[name='phone']").inputmask({ mask: '(999) 999-9999' });
  },
  'submit #userRegistrationForm'(e) {
    e.preventDefault();
    console.log('test');
  },
});

Template.UserRegistration.onDestroyed(function() {
  Session.delete('showingUserId');
  Session.delete('showingOtherUser');
});
