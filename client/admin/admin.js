import { getRaisedTotal, getDeadlineTotal, getDeadlineAdjustments, statuses } from '/imports/api/miscFunctions';
import { repeater } from '/imports/ui/js/jquery.repeater';
import { repeaterSetup } from '/imports/api/miscFunctions';
import '/imports/ui/stylesheets/admin-print.css';


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
    orientation: "bottom",
    autoclose: true
  });

  $('.date-picker').datepicker()
    .on('change', function(e) {
      // `e` here contains the extra attributes
      console.log(e.currentTarget);
      $(e.currentTarget).addClass('edited');
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
        return '$' + raisedTotal + ' raised of $' + deadlineTotalWithAdjustments.toFixed( 2 ) + ' total';
      }
      return '$' + raisedTotal + ' raised of $' + deadlineTotalWithAdjustments.toFixed( 2 ) + ' total';
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
  },
  showFundraisingModule(){
    let trip = Trips.findOne({tripId: this.tripId});
    if(trip){
      return trip.showFundraisingModule;
    }
  },
  showTripRaisedTotal(){
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
      return '** $' + returnAmount + ' raised of $' + deadlineTotal + ' total';
    } else {
      return "** 0";
    }
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
  'click #update-dt-funds'(e){
    e.preventDefault();
    Meteor.call("update.splits", function ( err, res ) {
      if(err){
        console.error(err);
        Bert.alert({
          message: 'Hmm...there was a problem getting updated. Try again in a few minutes and then contact the admin if you still have trouble.',
          type: 'danger',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-down'
        });
      } else {
        console.log(res);
        Bert.alert({
          title: 'Success',
          message: 'The DonorTools funds have been updated.',
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-up'
        });
      }
    });
    Bert.alert({
      title: 'Checking',
      message: 'Just asked DonorTools for an update, it might be a minute.',
      type: 'success',
      style: 'growl-bottom-right',
      icon: 'fa-refresh'
    });
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
      let tripStartDate = new Date($( "[name='tripStartDate']" ).val());
      let tripEndDate = new Date($( "[name='tripEndDate']" ).val());
      let tripExpirationDate = new Date($( "[name='tripExpirationDate']" ).val());
      let showFundraisingModule = $('#financial-module-no').is(':checked') ? 'no' : $('#financial-module-yes').is(':checked') ? 'yes' : false;
      if(!showFundraisingModule){
        Bert.alert( 'Please choose one of the options for the fundraising module', 'danger');
        btn.button("reset");
        return;
      } else {
        showFundraisingModule === 'yes' ? showFundraisingModule = true : showFundraisingModule = false;
      }
      if(!tripId || !tripStartDate || !tripEndDate || !tripExpirationDate) {
        Bert.alert( 'Please make sure you have a trip start date, end date, expiration date and a trip id', 'danger');
        btn.button("reset");
        return;
      }
      Session.set("tripId", tripId);
      Meteor.call( "add.trip", tripId, { tripStartDate, tripEndDate, tripExpirationDate, showFundraisingModule }, function ( err, res ) {
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
    $('#financial-module-no').prop('checked', false);
    $('#financial-module-yes').prop('checked', false);
    $( "#trip-form" ).slideUp();
  },
  'click .make-admin-link'(){
    Meteor.call( "add.roleToUser", this._id, 'admin', function ( err, res ) {
        if( err ) console.error( err );
        else {
          console.log( res );
          Bert.alert({
            title: 'Admin',
            message: 'This user has been updated.',
            type: 'success',
            style: 'growl-bottom-right',
            icon: 'fa-thumbs-up'
          });
        }
      } );
  },
  'click #print-page'(e){
    e.preventDefault();
    window.print();
  }
});