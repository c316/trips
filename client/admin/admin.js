import { getRaisedTotal, getDeadlineTotal } from '/imports/api/miscFunctions';

Template.Admin.onCreated(function () {
  this.autorun(()=>{
    Meteor.subscribe('users');
    Meteor.subscribe('Trips');
    Meteor.subscribe('Forms');
    Meteor.subscribe('Deadlines');
    Meteor.subscribe('DTSplits');
  });
});

Template.Admin.helpers({
  user(){
    return Meteor.users.find();
  },
  oddEven(){
    console.log("@index");
    return 'odd';
  },
  formsStatus(){
    // Get number of forms that are complete and since the MIF is the only one with many fields, get its status separately
    let tripForm = Forms.findOne({formName: 'tripRegistration', userId: this._id});
    if(tripForm && tripForm.tripId){
      return 'In Progress';
    } else {
      return 'Waiting for trip registration';
    }
  },
  raisedAmount(){
    let raisedTotal = getRaisedTotal(this._id);
    let deadlineTotal  = getDeadlineTotal(this._id);
    let needToRaiseThisAmount = deadlineTotal - raisedTotal;
    if(raisedTotal > 0){
      if(needToRaiseThisAmount <= 0){
        return '$' + raisedTotal + '/' + deadlineTotal;
      }
      return '$' + raisedTotal + '/' + deadlineTotal;
    } else {
      return 'Not Started';
    }
  }
});