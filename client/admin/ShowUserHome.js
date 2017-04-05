/*Template.ShowUserHome.onRendered(function () {
  Session.set("showingOtherUser", true);
  Tracker.autorun(function() {

  });
});*/

Template.ShowUserHome.onCreated(function () {
  this.autorun(()=>{
    Session.set("showingOtherUser", true);
    FlowRouter.watchPathChange();
    if(FlowRouter.current() && FlowRouter.current().queryParams.id){
      Session.set("showingUserId", FlowRouter.current().queryParams.id);
    }
    Meteor.subscribe('user', Session.get("showingUserId"));
  });
});

Template.ShowUserHome.helpers({
  thisUser(){
    return Meteor.users.findOne({_id: Session.get( 'showingUserId' )})
  }
});

Template.ShowUserHome.onDestroyed(function () {
  Session.delete("showingOtherUser");
  Session.delete("showingUserId");
});