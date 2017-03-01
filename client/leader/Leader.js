import { statuses } from '/imports/api/miscFunctions';

Template.Leader.onCreated(function () {
  Meteor.call("updateExpiredSignedURLS");
  Session.delete("showingUserId");
  this.autorun(()=>{
    Meteor.subscribe('users');
    if(Session.get("tripId")){
      Meteor.subscribe('Trips', Session.get("tripId"));
      Meteor.subscribe('TripLeader', Session.get("tripId"));
      Meteor.subscribe('files.images', "", Session.get("tripId"));
    }
  });
});

Template.Leader.onRendered(()=>{
  $('.date-picker').datepicker({
    orientation: "bottom",
    autoclose: true
  });

  $('.date-picker').datepicker()
    .on('change', function(e) {
      // `e` here contains the extra attributes
      console.log(e.currentTarget);
      $(e.currentTarget).addClass('edited');
    });
  Session.set("tripId", Meteor.user().tripId);
});

Template.Leader.helpers({
  formCompleted(name){
    const form = Forms.findOne( { name: name, userId: this._id,
      $or: [{completed: true}, {agreed: true}]
    } );
    return form;
  },
  formVerified(name){
    return Forms.findOne( { name: name, userId: this._id, verified: true} );
  },
  imageExists(){
    return Images.find({userId: this._id}).count();
  },
  images(){
    return Images.find({userId: this._id}).fetch()[0];
  },
  user(){
    if(Session.get("tripId")){
      return Meteor.users.find({tripId: Session.get("tripId")}, {sort: {'profile.lastName': 1}});
    } else {
      return Meteor.users.find({}, {sort: {'profile.lastName': 1}});
    }
  },
  trips(){
    return Trips.find();
  },
  trip(){
    if(this.tripId){
      return Trips.findOne({tripId: this.tripId});
    }
  },
  deadlines(){
    if(this.tripId){
      return Deadlines.find({tripId: this.tripId});
    }
  },
  formsStatus(){
    let tripForm = Forms.findOne( { name:  'tripRegistration', userId: this._id } );
    if(tripForm && tripForm._id){
      let forms = Forms.find({
        userId: this._id,
        name:  {
          $ne: 'tripRegistration'
        },
        $or: [{completed: true}, {agreed: true}]
      } );
      let totalNumberOfForms = forms && forms.count();
      if (totalNumberOfForms === 4){
        return statuses.completed;
      } else {
        return statuses.inProgress;
      }
    } else {
      return statuses.notStarted;
    }
  },
  tripName(){
    let trip = Trips.findOne({tripId: this.tripId});
    return trip && trip.name;
  },
  tripId(){
    let trip = this.tripId ? "- Trip ID: " + this.tripId : 'No trip';
    return trip;
  },
  thisTripId(){
    return Session.get("tripId");
  },
  newTrip(){
    return Trips.findOne({tripId: Number(Session.get("tripId"))});
  },
  deadlineAdjustmentValue(){
    let user = Template.parentData(2);
    let deadlineAdjustment = DeadlineAdjustments.findOne({tripId: user.tripId, userId: user._id, deadlineId: this._id});
    return deadlineAdjustment && deadlineAdjustment.adjustmentAmount;
  },
  filteringTrip(){
    return Session.get("tripId");
  },
  numberOfTripParticipants(){
    let tripId = Session.get("tripId");
    let users = Meteor.users.find({tripId: tripId});
    return users.count();
  },
  tripName(){
    let tripId = this.tripId || Session.get("tripId");
    return Trips.findOne({tripId}) && Trips.findOne({tripId}).name;
  },
});

Template.Leader.events({
  'click #delete-passport-photo'(e){
    console.log(this.userId);
    Meteor.call("delete.passportPhoto", this.userId);
  },
  'click .print-user'(){
    FlowRouter.go("print-one", {}, {id: this._id});
  },
  'click .verify-forms'(){
    FlowRouter.go("/leader/verify-forms/"  + this._id);
  },
});