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
    if(Session.get("showingUserId")) Meteor.subscribe('user', Session.get("showingUserId"));
  });
});

Template.Fundraising.helpers({
  DTSplits(){
    if(Session.get("showingUserId")){
      let user = Meteor.users.findOne({_id: Session.get("showingUserId")})
      let name = user && user.profile && (user.profile.firstName + " " + user.profile.lastName);
      return DTSplits.find({memo: name});
    } else {
      let name = Meteor.user() && Meteor.user().profile && (Meteor.user().profile.firstName + " " + Meteor.user().profile.lastName);
      if (name){
        return DTSplits.find({memo: name});
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