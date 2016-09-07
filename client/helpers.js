import moment from 'moment';

Template.registerHelper('formatTime', function(context) {
  if (context) {
    return moment( context ).format( 'MM/DD/YYYY, hh:mma' );
  }
});
Template.registerHelper('showTools', function() {
  const routeName = FlowRouter.current().route.path;
  return routeName.includes("admin");
});
