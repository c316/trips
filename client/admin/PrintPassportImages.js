Template.PrintPassportImages.onCreated(function () {
  Meteor.call("updateExpiredSignedURLS");
  this.autorun(()=> {
    tripId = new ReactiveVar(Number(FlowRouter.getParam("tripId")));
    Meteor.subscribe('users', '', 100, tripId.get(), false);
    Meteor.subscribe('files.images', "", tripId.get() );
  });
});
