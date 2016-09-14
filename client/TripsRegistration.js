import { statuses } from '/imports/api/miscFunctions';

Template.TripRegistration.onCreated(function () {
  this.autorun(()=>{
    Meteor.subscribe('Trips');
  });
});

Template.TripRegistration.helpers({
  status(){
    let tripForm = Forms.findOne({formName: 'tripRegistration'});
    if(tripForm && tripForm.tripId){
      return statuses.completed;
    } else {
      return statuses.notStarted;
    }
  }
});

Template.TripRegistration.events({
  'click #tripRegistrationFormSubmit, submit #tripRegistrationForm'(e){
    e.preventDefault();
    let tripId = $("[name='trip-id']").val();
    Meteor.call("form.tripRegistration", tripId, function ( err, res ) {
      if(err) console.error(err);
      else {
        console.log(res);
        // TODO: stop and start fund and form subscriptions

      }
    });
  },
});