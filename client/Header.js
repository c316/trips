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
});
