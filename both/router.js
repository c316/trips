
function redirectIfNotAdmin (ctx, redirect) {
  if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), 'admin')) {
    redirect('/')
  }
}

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

FlowRouter.route( '/fundraising', {
  name: 'fundraising',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Fundraising", footer: "Footer" });
  }
});

FlowRouter.route( '/profile', {
  name: 'profile',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "UserRegistration", footer: "Footer" });
  }
});

FlowRouter.route( '/forms', {
  name: 'forms',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Forms", footer: "Footer" });
  }
});

// Admin routes

FlowRouter.route( '/admin', {
  name: 'admin',
  triggersEnter: [redirectIfNotAdmin],
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Admin", footer: "Footer" });
  }
});

FlowRouter.route( '/admin/:trip', {
  name: 'trip',
  triggersEnter: [redirectIfNotAdmin],
  action() {
    const tripId = FlowRouter.getParam("trip");
    BlazeLayout.render( 'main', { top: "Header", main: 'TripAdmin', footer: "Footer" } );
  }
});

FlowRouter.route( '/admin/:trip/:fundraiser', {
  name: 'tripFundraiserDetails',
  triggersEnter: [redirectIfNotAdmin],
  action() {
    const tripId = FlowRouter.getParam("trip");
    const fundraiserId = FlowRouter.getParam("fundraiser");
    BlazeLayout.render( 'main', { top: 'Header', main: 'Fundraising', footer: "Footer" } );
  }
});