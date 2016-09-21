Template.ShowUserHome.onCreated(function () {
  this.autorun(()=>{
    Meteor.subscribe('user', Session.get("showingUserId"));
  });
});

Template.ShowUserHome.helpers({
  thisUser(){
    return Meteor.users.findOne({_id: Session.get( 'showingUserId')})
  }
});

Template.ShowUserHome.onDestroyed(function () {
  Session.delete("showingOtherUser");
});