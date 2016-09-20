Template.Home.onCreated(function () {
  this.autorun(()=>{
    if(Session.get("showingUserId")){
      console.log(Session.get("showingUserId"));
      Meteor.subscribe('user', Session.get("showingUserId"));
    }
  });
});

Template.Home.helpers({
  title(){
    return "Home";
  },
  user(){
    return Meteor.users.findOne({_id: Session.get("showingUserId")})
  },
  userFullName(){
    let user = Meteor.users.findOne({_id: Session.get("showingUserId")});
    if(user && user.profile) {
      return user.profile && user.profile.firstName + " " + user.profile.lastName;
    }
  }
});
