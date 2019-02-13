import { bertError, bertSuccess } from '../../imports/api/utils';

Template.AddTripIdToUserModal.onCreated(function() {
  this.autorun(() => {
    if (Session.get('tripId')) {
      Meteor.subscribe('Trips');
    }
  });
});

Template.AddTripIdToUserModal.helpers({
  trip() {
    return Trips.find();
  },
});

Template.AddTripIdToUserModal.events({
  'click #save-change'() {
    console.log('you clicked', $('#trips').val(), Session.get('showingUserId'));
    $('#trips-modal').modal('hide');
    Meteor.call(
      'form.tripRegistration',
      $('#trips')
        .val()
        .trim(),
      Session.get('showingUserId'),
      function(err, res) {
        if (err) {
          console.error(err);
          bertError(
            'Sorry',
            'Hmm...there was a problem adding that user to a trip. Try refreshing this page, then try again. If you still have problems, contact the admin.',
          );
        } else {
          console.log(res);
          bertSuccess('Leader', 'This user is now a member of that trip.');
          Meteor.call(
            'add.roleToUser',
            Session.get('showingUserId'),
            'leader',
            function(error, result) {
              if (error) console.error(error);
              else {
                console.log(result);
                bertSuccess('Leader', 'This user is now a trip leader.');
              }
            },
          );
        }
      },
    );
  },
});

Template.AddTripIdToUserModal.onDestroyed(function() {
  Session.delete('showingUserId', this._id);
});
