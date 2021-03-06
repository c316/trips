import { getRaisedTotal, getDeadlineTotal, statuses } from '/imports/api/miscFunctions';
import '/imports/ui/stylesheets/custom.css';

Template.Fundraising.onRendered(function() {
  if (Session.equals('showTripFunds', true)) {
    $('#expand-trip-funds').click();
    $('html, body').animate({
      scrollTop: ($('#fundraising-portlet').offset().top - 170),
    }, 500);
  }
});

Template.Fundraising.onCreated(function() {
  this.autorun(() => {
    Meteor.subscribe('DTSplits');
    Meteor.subscribe('Trips');
    if (Session.get('showingUserId')) {
      Meteor.subscribe('Forms', Session.get('showingUserId'));
      Meteor.subscribe('Deadlines', Session.get('showingUserId'));
    } else {
      Meteor.subscribe('Deadlines');
      Meteor.subscribe('Forms');
    }
  });
});

Template.Fundraising.helpers({
  DTSplits() {
    if (Session.get('showingUserId')) {
      const user = Meteor.users.findOne({ _id: Session.get('showingUserId') });
      const name = user && user.profile && (`${user.profile.firstName} ${user.profile.lastName}`);
      const thisUsersTrip = user.tripId;
      return DTSplits.find({ memo: { $regex: name, $options: 'i' }, fund_id: thisUsersTrip });
    }
    const name = Meteor.user() && Meteor.user().profile && (`${Meteor.user().profile.firstName} ${Meteor.user().profile.lastName}`);
    if (name) {
      return DTSplits.find();
    }
  },
  Deadlines() {
    return Deadlines.find();
  },
  totalRaised() {
    return getRaisedTotal(Session.get('showingUserId'));
  },
  amount() {
    return this.amount_in_cents && (this.amount_in_cents / 100).toFixed(2);
  },
  status() {
    const tripId = Meteor.users.findOne({ _id: this._id }) && Meteor.users.findOne({ _id: this._id }).tripId;
    if (tripId) {
      const deadlineTotal = getDeadlineTotal(this._id);
      const raisedTotal = getRaisedTotal(this._id);
      const needToRaiseThisAmount = deadlineTotal - raisedTotal;
      if (raisedTotal > 0) {
        if (needToRaiseThisAmount <= 0) {
          return statuses.completed;
        }
        return statuses.inProgress;
      }
      return statuses.notStarted;
    }
    return statuses.waitingForRegistration;
  },
  recognitionName() {
    if (this.persona.recognition_name) {
      return this.persona.recognition_name;
    }
    return 'No recognition name found';
  },
});
