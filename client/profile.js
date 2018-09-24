Template.Profile.helpers({
  title() {
    return 'Profile';
  },
  user() {
    if (!Session.get('showingOtherUser')) {
      return Meteor.user();
    }
    return Meteor.user();
  },
});
