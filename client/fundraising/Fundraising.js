import { getRaisedTotal, getDeadlineTotal, statuses } from '/imports/api/miscFunctions';
import '/imports/ui/stylesheets/custom.css';

Template.Fundraising.onRendered(function () {
  if(Session.equals("showTripFunds", true)){
    $("#expand-trip-funds").click();
    $('html, body').animate({
      scrollTop: ($('#fundraising-portlet').offset().top - 170)
    },500);
  }
});

Template.Fundraising.onCreated(function () {
  this.autorun(() => {
    Meteor.subscribe('DTSplits');
    Meteor.subscribe('Trips');
    if(Session.get("showingUserId")){
      Meteor.subscribe('Forms', Session.get("showingUserId"));
      Meteor.subscribe('Deadlines', Session.get("showingUserId"));
    } else {
      Meteor.subscribe('Deadlines');
      Meteor.subscribe('Forms');
    }
  });
});

Template.Fundraising.helpers({
  DTSplits(){
    if(Session.get("showingUserId")){
      let user = Meteor.users.findOne({_id: Session.get("showingUserId")});
      let name = user && user.profile && (user.profile.firstName + " " + user.profile.lastName);
      return DTSplits.find({memo: {$regex: name}});
    } else {
      let name = Meteor.user() && Meteor.user().profile && (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
      if (name){
        return DTSplits.find({memo: {$regex: name}});
      }
    }
  },
  Deadlines(){
    return Deadlines.find();
  },
  totalRaised(){
    return getRaisedTotal(Session.get('showingUserId'));
  },
  totalDeadlineAmount(){
    if(this && this.count() > 0) {
      let deadlineTotal = getDeadlineTotal(Session.get('showingUserId'));
      let raisedTotal   = getRaisedTotal(Session.get('showingUserId'));
      let needToRaiseThisAmount = deadlineTotal - raisedTotal;
      return needToRaiseThisAmount;
    } else {
      return getDeadlineTotal();
    }
  },
  amount(){
    return this.amount_in_cents && (this.amount_in_cents/100).toFixed(2);
  },
  status(){
    let tripForm = Forms.findOne({name: 'tripRegistration'});
    if(tripForm && tripForm.tripId){
      let deadlineTotal = getDeadlineTotal(this._id);
      let raisedTotal   = getRaisedTotal(this._id);
      let needToRaiseThisAmount = deadlineTotal - raisedTotal;
      if(raisedTotal > 0){
        if(needToRaiseThisAmount <= 0){
          return statuses.completed;
        }
        return statuses.inProgress;
      } else {
        return statuses.notStarted;
      }
    } else {
      return statuses.waitingForRegistration;
    }
  },
});