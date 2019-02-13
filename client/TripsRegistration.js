import { statuses } from '/imports/api/miscFunctions';
import { bertError, bertSuccess } from '../imports/api/utils';

Template.TripRegistration.onCreated(function() {
  const user = Meteor.users.findOne({ _id: Session.get('showingUserId') });
  this.autorun(() => {
    Meteor.subscribe('Trips', user && user.tripId);
  });
});

Template.TripRegistration.helpers({
  status() {
    const tripId =
      Meteor.users.findOne({ _id: this._id }) &&
      Meteor.users.findOne({ _id: this._id }).tripId;
    if (tripId) {
      return statuses.completed;
    }
    return statuses.notStarted;
  },
  tripName() {
    return (
      Trips.findOne({ tripId: this.tripId }) &&
      Trips.findOne({ tripId: this.tripId }).name
    );
  },
});

Template.TripRegistration.events({
  'click #tripRegistrationFormSubmit, submit #tripRegistrationForm'(event) {
    event.preventDefault();
    const tripId = $("[name='trip-id']")
      .val()
      .trim();
    const updateThisId = FlowRouter.getQueryParam('id');
    Meteor.call('form.tripRegistration', tripId, updateThisId, function(err) {
      if (err) {
        console.error(err);
        bertError('Error', err.reason);
      } else {
        bertSuccess('Registered', 'Ok, you are registered for this trip.');
        location.reload();
      }
    });
  },
  'click .change-trip'() {
    Meteor.call(
      'moveCurrentTripToOtherTrips',
      Session.get('showingUserId'),
      function(err) {
        if (err) console.error(err);
        else {
          bertSuccess(
            'Old trip removed',
            'Ok, you can now register for a new trip.',
          );
          location.reload();
        }
      },
    );
  },
});
