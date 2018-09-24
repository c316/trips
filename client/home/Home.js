Template.Home.helpers({
  title() {
    return 'Home';
  },
  otherUser() {
    if (Session.get('showingOtherUser')) {
      return true;
    }
  },
  user() {
    if (!Session.get('showingOtherUser')) {
      return Meteor.user();
    }
    return this;
  },
});

Template.Home.onDestroyed(function() {
  Session.delete('showTripFunds');
  Session.delete('showForms');
  Session.delete('showUserRegistration');
});
