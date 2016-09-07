import '/imports/ui/stylesheets/components-md.css';
import '/imports/ui/stylesheets/plugins-md.css';
import '/imports/ui/stylesheets/layout.css';

Template.main.onRendered(()=>{
  // Check that the user is logged in or logging in, and redirect to the login
  // path if they are not
  const path = FlowRouter.getRouteName();
  if (path !== 'login') {
    if( !Meteor.user() ) {
      if( !Meteor.loggingIn() ) {
        FlowRouter.go( "login" );
      }
    }
  }
});
