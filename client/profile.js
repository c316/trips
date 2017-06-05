Template.Profile.helpers( {
  title(){
    return "Profile";
  },
  user(){
    if( !Session.get( "showingOtherUser" ) ) {
      return Meteor.user();
    } else {
      return Meteor.user();
    }
  }
});