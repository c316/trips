import { getRaisedTotal, getDeadlineTotal, statuses } from '/imports/api/miscFunctions';
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
    let tripForm = Forms.findOne( { formName:  'tripRegistration', userId: this._id } );
    if(tripForm && tripForm._id){
      let forms = Forms.find({
        userId: this._id,
        formName:  {
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
  raisedAmount(){
    let raisedTotal = getRaisedTotal(this._id);
    let deadlineTotal  = getDeadlineTotal(this._id);
    let needToRaiseThisAmount = deadlineTotal - raisedTotal;
    if(raisedTotal > 0){
      if(needToRaiseThisAmount <= 0){
        return '$' + raisedTotal + ' raised of ' + deadlineTotal + ' total';
      }
      return '$' + raisedTotal + ' raised of ' + deadlineTotal + ' total';
    } else {
      return statuses.notStarted;
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
  'click .user-admin-link'(){
    FlowRouter.go("adminShowUserHome", {}, {id: this._id});
  },
  'click #show-add-trip'(e){
    e.preventDefault();
    $("#trip-form").slideDown(200);
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
          $( "#full-trip-form-div" ).slideDown(2000);

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