import { statuses } from '/imports/api/miscFunctions';
import { floatThead } from 'floatthead';
import { App } from '/imports/ui/js/app';

Template.Leader.onCreated(function() {
  Meteor.call('updateExpiredSignedURLS');
  Session.delete('showingUserId');
  Session.set('documentLimit', 30);
  Session.set('showExpired', false);

  this.autorun(() => {
    if (Session.get('tripId')) {
      const tripId = Number(Session.get('tripId'));
      Meteor.subscribe(
        'users',
        Session.get('searchValue'),
        Session.get('documentLimit'),
        tripId,
        false,
      );
      Meteor.subscribe('Trips', tripId);
      Meteor.subscribe('TripDeadlines', tripId);
      Meteor.subscribe('TripLeader', tripId);
      Meteor.subscribe('files.images', '', tripId);
    }
  });
});

Template.Leader.onRendered(() => {
  $('.date-picker').datepicker()
    .on('change', function(e) {
      // `e` here contains the extra attributes
      console.log(e.currentTarget);
      $(e.currentTarget).addClass('edited');
    });
  Session.set('tripId', Meteor.user().tripId);

  Meteor.setTimeout(function() {
    $('table#leader-table').floatThead({ top: 60, floatTableClass: 'grey-background' });
  }, 500);
});

Template.Leader.helpers({
  trip() {
    return Trips.findOne({ tripId: Number(Session.get('tripId')) });
  },
  user() {
    if (Session.get('tripId')) {
      return Meteor.users.find({ tripId: Session.get('tripId') }, { sort: { 'profile.lastName': 1 } });
    }
    return Meteor.users.find({}, { sort: { 'profile.lastName': 1 } });
  },
  trips() {
    return Trips.find();
  },
  deadlines() {
    if (this.tripId) {
      return Deadlines.find({ tripId: this.tripId });
    }
  },
  formsStatus() {
    const tripForm = Forms.findOne({ name: 'tripRegistration', userId: this._id });
    if (tripForm && tripForm._id) {
      const forms = Forms.find({
        userId: this._id,
        name: {
          $ne: 'tripRegistration',
        },
        $or: [{ completed: true }, { agreed: true }],
      });
      const totalNumberOfForms = forms && forms.count();
      if (totalNumberOfForms === 4) {
        return statuses.completed;
      }
      return statuses.inProgress;
    }
    return statuses.notStarted;
  },
  tripId() {
    const trip = this.tripId ? `- Trip ID: ${this.tripId}` : 'No trip';
    return trip;
  },
  thisTripId() {
    return Session.get('tripId');
  },
  newTrip() {
    return Trips.findOne({ tripId: Number(Session.get('tripId')) });
  },
  deadlineAdjustmentValue() {
    const user = Template.parentData(2);
    const deadlineAdjustment = DeadlineAdjustments.findOne({ tripId: user.tripId, userId: user._id, deadlineId: this._id });
    return deadlineAdjustment && deadlineAdjustment.adjustmentAmount;
  },
  filteringTrip() {
    console.log(Session.get('tripId'));
    return Session.get('tripId');
  },
  numberOfTripParticipants() {
    const tripId = Session.get('tripId');
    const users = Meteor.users.find({ tripId });
    return users.count();
  },
});

Template.Leader.events({
  'click #delete-passport-photo'(e) {
    console.log(this.userId);
    Meteor.call('delete.passportPhoto', this.userId);
  },
  'click .print-user'() {
    FlowRouter.go('print-one', {}, { id: this._id });
  },
  'click .verify-forms'() {
    App.scrollTo($('.page-content'));
    FlowRouter.go(`/leader/verify-forms/${this._id}`);
  },
});
