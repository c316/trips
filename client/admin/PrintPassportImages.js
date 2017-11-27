Template.PrintPassportImages.onCreated(function () {
  Meteor.call("updateExpiredSignedURLS");
  tripId = new ReactiveVar(Number(FlowRouter.getParam("tripId")));
  this.autorun(()=> {
    Meteor.subscribe('users', '', 100, tripId.get(), false);
    Meteor.subscribe('files.images', "", tripId.get() );
  });
});
