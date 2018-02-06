Template.FundraisingPage.helpers( {
  title(){
    return "Fundraising";
  },
  user(){
    if( !Session.get( "showingOtherUser" ) ) {
      return Meteor.user();
    } else {
      return Meteor.user();
    }
  }
});