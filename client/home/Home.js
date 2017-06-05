Template.Home.onRendered(function () {
  if(Meteor.user() && Meteor.user().tripId && Meteor.user().tripId === 73315) {
    Bert.alert( {
      message: 'Thanks for helping us test our Trips app. ' +
               'If you have questions or run into problems, call (<a href="tel:+17852466845">785-246-6845</a>)' +
               ' or email (<a href="mailto:support@trashmountain.com?subject=Trips App" target="_blank">support@trashmountain.com</a>).',
      type:    'default',
      style:   'fixed-bottom',
      icon:    'fa-thumbs-up'
    } );
  }
});

Template.Home.helpers({
  title(){
    return "Home";
  },
  otherUser(){
    if (Session.get("showingOtherUser")) {
      return true;
    }
  },
  user(){
    if (!Session.get("showingOtherUser")) {
      return Meteor.user();
    } else {
      return this;
    }
  },
  userFullName(){
    return this.profile && this.profile.firstName + " " + this.profile.lastName;
  },
});

Template.Home.onDestroyed(function () {
  Session.delete("showTripFunds");
  Session.delete("showForms");
  Session.delete("showUserRegistration");
});