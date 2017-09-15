import { repeater } from '/imports/ui/js/jquery.repeater';
import { repeaterSetup, setDocHeight, updateSearchVal } from '/imports/api/miscFunctions';
import '/imports/ui/stylesheets/admin-print.css';

Template.Admin.onCreated(function () {
  Session.delete("showingUserId");
  Session.set("documentLimit", 30);
  this.autorun(()=>{
    Meteor.subscribe('users', Session.get("searchValue"), Session.get("documentLimit"), (Session.get("tripId") ? Number(Session.get("tripId")) : null));
    Meteor.subscribe('Trips', Session.get("tripId") ? Number(Session.get("tripId")) : null);
    Meteor.subscribe('Forms');
    Meteor.subscribe('Deadlines');
    Meteor.subscribe('DeadlineAdjustments');
    Meteor.subscribe('DTSplits');
    Meteor.subscribe('Images');
  });
});

Template.Admin.onRendered(()=>{
  repeaterSetup();
  setDocHeight();
  $('.date-picker').datepicker({
    orientation: "bottom",
    autoclose: true
  });

  $('.date-picker').datepicker()
    .on('change', function(e) {
      // `e` here contains the extra attributes
      $(e.currentTarget).addClass('edited');
    });
});

Template.Admin.helpers({
  user(){
    if(Session.get("tripId")){
      return Meteor.users.find({tripId: Session.get("tripId")}, {sort: {'profile.lastName': 1, 'profile.firstName': 1}});
    } else {
      return Meteor.users.find({}, {sort: {'profile.lastName': 1, 'profile.firstName': 1}});
    }
  },
  trips(){
    return Trips.find({}, { sort: { name: 1 } });
  },
  trip(){
    if(this.tripId){
      return Trips.findOne({tripId: this.tripId});
    }
    if(Session.get("tripId")){
      return Trips.findOne({ tripId: Number(Session.get("tripId")) });
    }
  },
  deadlines(){
    if(this.tripId){
      return Deadlines.find({tripId: this.tripId});
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
  forms() {

    const tripId = Meteor.users.findOne({_id: this._id}) && Meteor.users.findOne({_id: this._id}).tripId;
    const passportImage = Images.findOne( { userId: this._id } );

    // Past trips, some users might have gone on a trip in the past, and completed forms, but don't have a trip that
    // they are currently registered for
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
            return [{name: 'All Verified', complete: true}];
          }
          return [{name: 'All Completed', complete: true}];
        } else {
          return [
            {
              name: 'MIF',
              complete: true
            },
            {
              name: 'MRF',
              complete: true
            },
            {
              name: 'CoC',
              complete: true
            },
            {
              name: 'RWL',
              complete: true
            },
            {
              name: 'Pic',
              complete: false
            }
          ];
        }
      } else {
        const formStatus = [];
        const MIF = Forms.findOne({
          name: 'missionaryInformationForm',
          userId: this._id,
          completed: true
        });
        const MRF = Forms.findOne({
          name: 'media-release',
          userId: this._id,
          agreed: true
        });
        const CoC = Forms.findOne({
          name: 'code-of-conduct',
          userId: this._id,
          agreed: true
        });
        const WoL = Forms.findOne({
          name: 'waiver-of-liability',
          userId: this._id,
          agreed: true
        });
        if(passportImage){
          formStatus.push({name: 'Pic', complete: true});
        } else {
          formStatus.push({name: 'Pic', complete: false});
        }
        if(MIF){
          formStatus.push({name: 'MIF', complete: true});
        } else {
          formStatus.push({name: 'MIF', complete: false});
        }
        if(MRF){
          formStatus.push({name: 'MRF', complete: true});
        } else {
          formStatus.push({name: 'MRF', complete: false});
        }
        if(CoC){
          formStatus.push({name: 'CoC', complete: true});
        } else {
          formStatus.push({name: 'CoC', complete: false});
        }
        if(WoL){
          formStatus.push({name: 'WoL', complete: true});
        } else {
          formStatus.push({name: 'WoL', complete: false});
        }
        return formStatus;
        }
    } else {
      return [{name: 'Not Started', complete: false}];
    }
  }
});

Template.Admin.events({
  'keyup, change .search': _.debounce(function() {
    updateSearchVal();
  }, 300),
  'click .clear-button': function() {
    $(".search").val("").change();
    Session.set("searchValue", "");
    Session.set( "documentLimit", 30);
  },
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
    Trips.find({expires: {$gte: new Date()}}).map(function ( trip ) {
      Meteor.call("update.splits", trip.tripId);
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
      Meteor.call( "add.trip", tripId, { tripStartDate, tripEndDate, tripExpirationDate, showFundraisingModule }, function ( err, res ) {
        if( err ) {
          console.error( err );
          Bert.alert( err.reason, 'danger');
          btn.button('error');

          $("#show-add-trip").prop("disabled",false);
          $("#show-add-trip").css( 'cursor', 'pointer' );
        } else {
          console.log( res );
          Session.set("tripId", tripId);

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
          Bert.alert( 'Ok, you should now see the deadline adjustment.', 'success');
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
  'click .make-trip-leader'(){
    const updateThisUser = Meteor.users.findOne({_id: this._id});
    Session.set("showingUserId", this._id);
    if(updateThisUser && updateThisUser.tripId) {
      Meteor.call("add.roleToUser", this._id, 'leader', function (err, res) {
        if (err) console.error(err);
        else {
          console.log(res);
          Bert.alert({
            title: 'Leader',
            message: 'This user is now a trip leader.',
            type: 'success',
            style: 'growl-bottom-right',
            icon: 'fa-thumbs-up'
          });
        }
      });
    } else {
      $('#trips-modal').modal();
    }
  },
  'click #print-page'(e){
    e.preventDefault();
    window.print();
  }
});

Template.Admin.onDestroyed(function () {
  Session.delete("tripId");
  Session.delete("showingUserId");
  Session.delete("searchValue");
  Session.delete("documentLimit");
  $(window).unbind('scroll');
});