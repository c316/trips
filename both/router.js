FlowRouter.route( '/', {
  name: 'home',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Home", footer: "Footer" });
  }
});

FlowRouter.route( '/login', {
  name: 'login',
  action() {
    BlazeLayout.render( 'login', { login: 'LoginContent', footer: "Footer" } );
  }
});

FlowRouter.route( '/admin', {
  name: 'admin',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Admin", footer: "Footer" });
  }
});

FlowRouter.route( '/admin/:trip', {
  name: 'trip',
  action() {
    const tripId = FlowRouter.getParam("trip");
    BlazeLayout.render( 'main', { top: "Header", main: 'TripAdmin', footer: "Footer" } );
  }
});

FlowRouter.route( '/admin/:trip/:fundraiser', {
  name: 'tripFundraiserDetails',
  action() {
    const tripId = FlowRouter.getParam("trip");
    const fundraiserId = FlowRouter.getParam("fundraiser");
    BlazeLayout.render( 'main', { top: 'Header', main: 'Fundraising', footer: "Footer" } );
  }
});