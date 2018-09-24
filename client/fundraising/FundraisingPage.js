Template.FundraisingPage.helpers({
  title() {
    return 'Fundraising';
  },
  user() {
    if (!Session.get('showingOtherUser')) {
      return Meteor.user();
    }
    return Meteor.user();
  },
});
