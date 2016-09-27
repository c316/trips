import { statuses } from '/imports/api/miscFunctions';

Template.TripRegistration.onCreated(function () {
  this.autorun(()=>{
    Meteor.subscribe('Trips');
  });
});

Template.TripRegistration.helpers({
  status(){
    let tripForm = Forms.findOne({name: 'tripRegistration'});
    if(tripForm && tripForm.tripId){
      return statuses.completed;
    } else {
      return statuses.notStarted;
    }
  },
  tripName(){
    let trip = Trips.findOne({tripId: this.tripId});
    return trip && trip.name;
  },
});

Template.TripRegistration.events({
  'click #tripRegistrationFormSubmit, submit #tripRegistrationForm'(e){
    e.preventDefault();
    let tripId = $("[name='trip-id']").val();
    let updateThisId = FlowRouter.getQueryParam('id');

    Meteor.call("form.tripRegistration", tripId, updateThisId, function ( err, res ) {
      if(err) console.error(err);
      else {
        console.log(res);
        // TODO: stop and start fund and form subscriptions

      }
    });
  },
});