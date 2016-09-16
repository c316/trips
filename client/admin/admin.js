import { getRaisedTotal, getDeadlineTotal } from '/imports/api/miscFunctions';
import { repeater } from '/imports/ui/js/jquery.repeater';
import { repeaterSetup } from '/imports/api/miscFunctions';


Template.Admin.onCreated(function () {
  Session.delete("showingUserId");
  this.autorun(()=>{
    Meteor.subscribe('users');
    Meteor.subscribe('Trips');
    Meteor.subscribe('Forms');
    Meteor.subscribe('Deadlines');
    Meteor.subscribe('DTSplits');
  });
});

Template.Admin.onRendered(()=>{
  repeaterSetup();
  $('.date-picker').datepicker({
    orientation: "left",
    autoclose: true
  });
});

Template.Admin.helpers({
  user(){
    return Meteor.users.find();
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
  },
  tripId(){
    return Session.get("tripId");
  },
  newTrip(){
    return Trips.findOne({tripId: Number(Session.get("tripId"))});
  }
});

Template.Admin.events({
  'click .user-profile-admin-link'(e){
    Session.set("showingUserId", this._id);
    Session.set("showUserRegistration", true);
    FlowRouter.go("profile");
  },
  'click .forms-admin-link'(e){
    Session.set("showingUserId", this._id);
    Session.set("showForms", true);
    FlowRouter.go("forms");
  },
  'click .fundraising-admin-link'(e){
    Session.set("showingUserId", this._id);
    Session.set("showTripFunds", true);
    FlowRouter.go("fundraising");
  },
  'click #show-add-trip'(e){
    e.preventDefault();
    $("#trip-form").slideDown();
    $("#show-add-trip").prop("disabled",true);
    $("#show-add-trip").css( 'cursor', 'not-allowed' );
  },
  'submit form'(e){
    e.preventDefault();
    let formId = e.target.id;
    console.log(e.target.id);
    let btn = $('#' + e.target.id + "-button");
    btn.button("loading");
    if (formId === "trip-form") {
      let tripId = $( "[name='trip-id']" ).val();
      if(!tripId) return;
      Session.set("tripId", tripId);
      Meteor.call( "add.trip", tripId, function ( err, res ) {
        if( err ) {
          console.error( err );
          Bert.alert( " " + err, 'danger');
          btn.button('error');

          $("#show-add-trip").prop("disabled",false);
          $("#show-add-trip").css( 'cursor', 'pointer' );
        } else {
          console.log( res );
          Bert.alert( 'Ok, we have a trip now add the details, please.', 'success');
          btn.button('success');
          // reset the add-trip form
          e.target.reset();
          $( "#trip-form" ).slideUp();
          // Show the full-trip-form
          $( "#full-trip-form-div" ).slideDown();

          $("#show-add-trip").prop("disabled",false);
          $("#show-add-trip").css( 'cursor', 'pointer' );
          Meteor.call( "update.splits", Number(tripId), function ( err, res ) {
            if (err) console.error(err);
            else console.log(res);
          } );
        }
      } );

    } else if (formId === 'full-trip-form') {
      let formatedRepeaterForm = $('.mt-repeater').repeaterVal();
      let tripId = Session.get("tripId");
      Meteor.call("add.deadline", formatedRepeaterForm.deadlines, tripId, function ( err, res ) {
        if(err) {
          console.error(err);
          Bert.alert(" " + err, 'danger');
          btn.button('error');
        } else {
          console.log(res);
          Bert.alert( 'Thanks for adding the deadlines, users can now join this trip.', 'success');
          $( "#full-trip-form-div" ).slideUp();
          btn.button('success');
          e.target.reset();
        }
      });
    }
  },
});