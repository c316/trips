Template.PrintPassportImages.onCreated(function () {
  Meteor.call("updateExpiredSignedURLS");
  this.autorun(()=> {
    tripId = new ReactiveVar(Number(FlowRouter.getParam("tripId")));
    Meteor.subscribe('users');
    Meteor.subscribe('files.images', "", tripId.get() );
  });
});

Template.PrintPassportImages.onRendered(function () {
  Meteor.setTimeout(()=>{
    if(tripId.get() && Meteor.users.findOne( { tripId: tripId.get() } ) ) {
      window.print();
    }
  }, 2000);
});
