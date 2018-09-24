Template.FormsPage.helpers({
  title() {
    return 'Forms';
  },
  user() {
    if (!Session.get('showingOtherUser')) {
      return Meteor.user();
    }
    return Meteor.user();
  },
});
