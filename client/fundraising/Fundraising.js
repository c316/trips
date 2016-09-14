import { getRaisedTotal, getDeadlineTotal, statuses } from '/imports/api/miscFunctions';

Template.Fundraising.onRendered(function () {
  if(Session.equals("showTripFunds", true)){
    $("#expand-trip-funds").click();
  }
});


Template.Fundraising.onCreated(function () {
  this.autorun(() => {
    Meteor.subscribe('DTSplits');
    Meteor.subscribe('Deadlines');
    Meteor.subscribe('Forms');
    Meteor.subscribe('Trips');
  });
});

Template.Fundraising.helpers({
  DTSplits(){
    let name = Meteor.user() && Meteor.user().profile && (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
    if (name){
      return DTSplits.find({memo: name});
    }
  },
  Deadlines(){
    return Deadlines.find();
  },
  totalRaised(){
    return getRaisedTotal();
  },
  totalDeadlineAmount(){
    if(this && this.count() > 0) {
      let deadlineTotal = getDeadlineTotal();
      let raisedTotal   = getRaisedTotal();
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
    let tripForm = Forms.findOne({formName: 'tripRegistration'});
    if(tripForm && tripForm.tripId){
      let deadlineTotal = getDeadlineTotal();
      let raisedTotal   = getRaisedTotal();
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