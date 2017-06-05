import moment from 'moment';
import { getRaisedTotalForTrip,
  getDeadlinesTotalForTrip,
  getDeadlineAdjustmentsForTrip,
  getRaisedTotal,
  getDeadlineTotal,
  getDeadlineAdjustments,
  statuses
  } from '/imports/api/miscFunctions';

Template.registerHelper('formatTime', function(context) {
  if (context) {
    return moment( context ).format( 'MM/DD/YYYY, hh:mma' );
  }
});

Template.registerHelper('showTools', function() {
  const routeName = FlowRouter.getRouteName();
  if(routeName) return routeName.includes("admin");
});

Template.registerHelper('submitFormText', function(e) {
  let agreed;
  if(e) {
    let thisForm = Forms.findOne({name: e, userId: this._id});
    if (thisForm && thisForm.agreed) {
      agreed = "Agreed to on: " + moment(thisForm.agreedDate).format("MM/DD/YYYY") + " <i class='fa fa-check'></i>";
    }
  }
  return {
    "data-loading-text": "Processing... <i class='fa fa-spinner fa-spin'></i>",
    "data-error-text":   "Hmm...that didn't work. Please look over your form and try again <i class='fa fa-exclamation-triangle'></i>",
    "data-success-text": agreed || "Got it! <i class='fa fa-check'></i>"
  }
});

Template.registerHelper('agreed', function(e) {
  let thisForm = Forms.findOne({name: e, userId: this._id});
  if(thisForm && thisForm.agreed){
    Meteor.setTimeout(()=>{
      $("#" + e).button('success');
      $("#" + e).tooltip();
    }, 200);
    return {
      "disabled": "disabled"
    }
  }
  if(Roles.userIsInRole(Meteor.userId(), 'admin') && Meteor.user()._id !== Session.get("showingUserId")) {
    // Admins can't agree to terms for another user, only the user can do this
    return {"disabled": "disabled"};
  }

});

Template.registerHelper('passportPhotoThumbnail', function() {
  if(this.versions && this.versions.thumbnail){
    console.log(this.versions.thumbnail.meta.signedURL);
    return this.versions.thumbnail.meta.signedURL;
  }
});
Template.registerHelper('passportPhotoOriginal', function() {
  if(this.versions && this.versions.original) {
    return this.versions.original.meta.signedURL;
  }
});

Template.registerHelper('noTripRegistration', function() {
  let tripId = Meteor.users.findOne({_id: this._id})
    && Meteor.users.findOne({_id: this._id}).tripId;
  if(tripId){
    return;
  } else {
    let trips = Meteor.users.findOne({_id: this._id})
      && Meteor.users.findOne({_id: this._id}).otherTrips;
    if(trips){
      return;
    }
    return {
      style: 'background-color: #eee'
    }
  }
});

Template.registerHelper('otherTripsRegistration', function() {
  let trips = Meteor.users.findOne({_id: this._id})
    && Meteor.users.findOne({_id: this._id}).otherTrips;
  if(trips){
    return true;
  }
  return false;
});

Template.registerHelper('noTripRegistrationExpand', function() {
  let tripId = Meteor.users.findOne({_id: this._id}) && Meteor.users.findOne({_id: this._id}).tripId;
  if(tripId){
    return {
      style: 'display: none;'
    }
  }
  return;
});

Template.registerHelper('oddEven', function(index) {
  if((index % 2) === 0) return 'even';
  else return 'odd';
});

Template.registerHelper('selected', function(key, value) {
  if(this[key] && this[key] === value){
    return {'selected': 'selected'};
  }
});


Template.registerHelper('checked', function(name, value) {
  if(this[name] && this[name] === value){
    return {'checked': 'checked'};
  }
});


Template.registerHelper('multiChecked', function(name, value) {
  if(this[name] && this[name].indexOf(value) !== -1){
    return {'checked': 'checked'};
  }
});

Template.registerHelper('editedClass', function(value) {
  if(value)
  return 'edited';
});

Template.registerHelper('appVersion', function(){
  return '1.3.1'
});


Template.registerHelper('thisUserIsInRole', function(_id, role){
  return Roles.userIsInRole(_id, role.split(", "));
});

Template.registerHelper('formatDate', function(date) {
    return moment(new Date(date)).format('MM/DD/YYYY');
});

Template.registerHelper('formatMoney', function(amount) {
    return amount.toLocaleString();
});

Template.registerHelper('totalRaisedForTrip', function() {
  let totalRaised = getRaisedTotalForTrip(Session.get("tripId"));
  let totalAdjustments = getDeadlineAdjustmentsForTrip(Session.get("tripId"));
  return Number(totalRaised - totalAdjustments).toLocaleString();
});

Template.registerHelper('totalNeededForTrip', function() {
  let tripId = Number(Session.get("tripId"));
  let totalNeeded = getDeadlinesTotalForTrip(tripId);
  console.log(totalNeeded);
  let users = Meteor.users.find({tripId: tripId});
  return Number(totalNeeded * users.count()).toLocaleString();
});


Template.registerHelper('raisedAmount', function() {
  let raisedTotal = getRaisedTotal(this._id);
  let deadlineTotal  = getDeadlineTotal(this._id);
  let deadlineAdjustments  = getDeadlineAdjustments(this._id);
  let needToRaiseThisAmount = deadlineTotal - raisedTotal;
  let deadlineTotalWithAdjustments = Number(deadlineTotal) + Number(deadlineAdjustments);
  if(raisedTotal > 0){
    if(needToRaiseThisAmount <= 0){
      return '$' + Number(raisedTotal).toLocaleString() + ' raised of $' + Number(deadlineTotalWithAdjustments).toLocaleString() + ' total';
    }
    return '$' + Number(raisedTotal).toLocaleString() + ' raised of $' + Number(deadlineTotalWithAdjustments).toLocaleString() + ' total';
  } else {
    return statuses.notStarted;
  }
});


Template.registerHelper('showTripRaisedTotal', function() {
  let splits = DTSplits.find({fund_id: this.tripId});
  if(splits && splits.count() > 0){
    let total_in_cents = splits.map(function ( item ) {
      return item.amount_in_cents;
    });
    let sum = total_in_cents.reduce(add, 0);

    function add(a, b) {
      return a + b;
    }
    let deadlineTotal  = getDeadlineTotal(this._id);
    let returnAmount = (sum / 100).toFixed( 2 );
    return '** $' + Number(returnAmount).toLocaleString() + ' raised of $' + Number(deadlineTotal).toLocaleString() + ' total';
  } else {
    return "** 0";
  }
});

Template.registerHelper('showFundraisingModule', function() {
  if(this.tripId){
    let trip = Trips.findOne({tripId: this.tripId});
    if(trip){
      return trip.showFundraisingModule;
    }
  }
});

Template.registerHelper('status', function() {
  const tripId = Meteor.users.findOne({_id: this._id}) && Meteor.users.findOne({_id: this._id}).tripId;
  const passportImage = Images.findOne( { userId: this._id } );
  let otherTrips = Meteor.users.findOne({_id: this._id})
    && Meteor.users.findOne({_id: this._id}).otherTrips;

  if(tripId || otherTrips){
    const forms = Forms.find({
      name:  {
        $ne: 'tripRegistration'
      },
      userId: this._id,
      $or: [{completed: true}, {agreed: true}]
    } );
    let totalNumberOfForms = forms && forms.count();
    if (totalNumberOfForms > 3){
      if(passportImage){
        const verifiedForms = Forms.find({userId: this._id, verified: true});
        let totalNumberOfForms = verifiedForms && verifiedForms.count();
        if (totalNumberOfForms === 4) {
          return statuses.verified;
        }
        return statuses.completed;
      } else {
        return statuses.needPassportPic;
      }
    } else {
      return statuses.inProgress;
    }
  } else {
    return statuses.notStarted;
  }
});

Template.registerHelper('formStarted', function(name) {
  const form = Forms.findOne( { name: name, userId: this._id, archived: { $ne: true } });
  return form;
});

Template.registerHelper('formCompleted', function(name) {
  const form = Forms.findOne( {
    name: name,
    userId: this._id,
    $or: [{completed: true}, {agreed: true}],
    archived: { $ne: true }
  } );
  return form;
});

Template.registerHelper('formVerified', function(name) {
  return Forms.findOne( {
    name: name,
    userId: this._id,
    verified: true,
    archived: { $ne: true }
  } );
});

Template.registerHelper('ShowFundraisingModule', function() {
  let user;
  if (Session.get("showingOtherUser")) {
    user = this;
  } else {
    user = Meteor.user();
  }
  if (user && user.tripId) {
    let trip = Trips.findOne({tripId: user.tripId});
    return trip && trip.showFundraisingModule;
  }
});