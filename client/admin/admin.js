import { getRaisedTotal, getDeadlineTotal, getDeadlineAdjustments, statuses } from '/imports/api/miscFunctions';
import { repeater } from '/imports/ui/js/jquery.repeater';
import { repeaterSetup } from '/imports/api/miscFunctions';


Template.Admin.onCreated(function () {
  Session.delete("showingUserId");
  this.autorun(()=>{
    Meteor.subscribe('users');
    Meteor.subscribe('Trips');
    Meteor.subscribe('Forms');
    Meteor.subscribe('DeadlineAdjustments');
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
    if(Session.get("tripId")){
      return Meteor.users.find({tripId: Session.get("tripId")});
    } else {
      return Meteor.users.find();
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
  raisedAmount(){
    let raisedTotal = getRaisedTotal(this._id);
    let deadlineTotal  = getDeadlineTotal(this._id);
    let deadlineAdjustments  = getDeadlineAdjustments(this._id);
    let needToRaiseThisAmount = deadlineTotal - raisedTotal;
    let deadlineTotalWithAdjustments = Number(deadlineTotal) + Number(deadlineAdjustments);
    if(raisedTotal > 0){
      if(needToRaiseThisAmount <= 0){
        return '$' + raisedTotal + ' raised of ' + deadlineTotalWithAdjustments + ' total';
      }
      return '$' + raisedTotal + ' raised of ' + deadlineTotalWithAdjustments + ' total';
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
  newTrip(){
    return Trips.findOne({tripId: Number(Session.get("tripId"))});
  },
  deadlineAdjustmentValue(){
    let user = Template.parentData(2);
    let deadlineAdjustment = DeadlineAdjustments.findOne({tripId: user.tripId, userId: user._id, deadlineId: this._id});
    return deadlineAdjustment && deadlineAdjustment.adjustmentAmount;
  }
});

Template.Admin.events({
  'click .user-admin-link'(){
    Session.set("showUserRegistration", true);
    FlowRouter.go("adminShowUserHome", {}, {id: this._id});
  },
  'click .funding-admin-link'(){
    let trip = Trips.findOne({tripId: this.tripId});
    if(trip && trip.name){
      Session.set("showTripFunds", true);
    }
    FlowRouter.go("adminShowUserHome", {}, {id: this._id});
  },
  'click .form-admin-link'(){
    let trip = Trips.findOne({tripId: this.tripId});
    if(trip && trip.name){
      Session.set("showForms", true);
    }
    FlowRouter.go("adminShowUserHome", {}, {id: this._id});
  },
  'click .deadlines-admin-link'(){
    console.log("Clicked deadlines for: ", this._id);
    $("#collapse-edit-" + this._id).toggle();
  },
  'click .print-user'(){
    FlowRouter.go("print-one", {}, {id: this._id});
  },
  'click #show-add-trip'(e){
    e.preventDefault();
    $("#trip-form").slideDown(200);
    $("#show-add-trip").prop("disabled",true);
    $("#show-add-trip").css( 'cursor', 'not-allowed' );
  },
  'click .filter-trip'(){
    Session.set("tripId", this.tripId);
  },
  'click .export-trip-mif'(){
    Meteor.call("export.formByTrip", this.tripId, function ( err, fileContent ) {
      if( err ) {
        console.error( err );
        Bert.alert( err.reason, 'danger');
      } else if(fileContent){
        var nameFile = 'Missionary Information Forms for Trip ' + this.tripId + '.csv';
        var blob = new Blob([fileContent], {type: "text/plain;charset=utf-8"});
        import fileSaver from 'file-saver';
        fileSaver.saveAs(blob, nameFile);
      }
    });
  },
  'click #show-all-trips'(){
    Session.delete("tripId");
  },
  'submit form'(e){
    e.preventDefault();
    let formId = e.target.id;
    let formName = e.target.name;
    let btn = $('#' + e.target.id + "-button");
    btn.button("loading");
    if (formId === "trip-form") {
      let tripId = $( "[name='trip-id']" ).val();
      if(!tripId) return;
      Session.set("tripId", tripId);
      Meteor.call( "add.trip", tripId, function ( err, res ) {
        if( err ) {
          console.error( err );
          Bert.alert( err.reason, 'danger');
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
          Bert.alert(err.reason, 'danger');
          btn.button('error');
        } else {
          console.log(res);
          Bert.alert( 'Thanks for adding the deadlines, users can now join this trip.', 'success');
          $( "#full-trip-form-div" ).slideUp();
          btn.button('success');
          e.target.reset();
        }
      });
    } else if (formName === 'update-deadline') {
      console.log(e.target.getAttribute('data-userid'));
      let user = Meteor.users.findOne({_id: e.target.getAttribute('data-userid')});

      let deadlines = [];
      let deadlineAdjustments = Deadlines.find({tripId: user.tripId}).map(function ( deadline ) {
        deadlines.push({deadlineId: deadline._id, adjustmentAmount: e.target[deadline._id].value});
      });
      Meteor.call("update.user.deadline", deadlines, user._id, user.tripId, function ( err, res ) {
        if(err) {
          console.error(err);
          Bert.alert(err.reason, 'danger');
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
  'click #trip-form-cancel-button'(){
    $("#show-add-trip").prop("disabled",false);
    $("#show-add-trip").css( 'cursor', 'pointer' );
    $( "#trip-form" ).slideUp();
  }
});