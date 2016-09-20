import '/imports/ui/stylesheets/simple-line-icons.css';
import { App } from '/imports/ui/js/app';
import { Layout } from '/imports/ui/js/layout';

Template.Header.onRendered(()=>{
  App.init();
  Layout.init();
});

Template.Header.events({
  'click .logout'(e){
    e.preventDefault();
    console.log('Logout clicked');
    Meteor.logout();
    FlowRouter.go("login");
  },
  'click .profile-button'(e){
    e.preventDefault();
    Session.set("showUserRegistration", true);
    FlowRouter.go("profile");
  },
  'click .trip-funds-button'(e){
    e.preventDefault();
    Session.set("showTripFunds", true);
    FlowRouter.go("fundraising");
  },
  'click .forms-button'(e){
    e.preventDefault();
    Session.set("showForms", true);
    FlowRouter.go("forms");
  },
  'click .home-button'(e){
    e.preventDefault();
    Session.delete("showForms");
    Session.delete("showUserRegistration");
    Session.delete("showTripFunds");
    Session.delete("showingUserId");
    FlowRouter.go("home");
  },
  'click .admin-button'(e){
    e.preventDefault();
    Session.delete("showForms");
    Session.delete("showUserRegistration");
    Session.delete("showTripFunds");
    FlowRouter.go("admin");
  }
});

Template.Header.helpers({
  firstName() {
    return Meteor.user() &&
      Meteor.user().profile &&
      Meteor.user().profile.firstName;
  },
  isAdminRoute(){
    const routeName = FlowRouter.getRouteName();
    if(routeName === 'admin') return 'active open selected';
  },
});

Template.Header.onDestroyed(()=>{
  $('body').off();
  Session.delete("showUserRegistration");
  Session.delete("showTripFunds");
  Session.delete("showForms");
});
