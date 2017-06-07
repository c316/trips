function redirectIfNotAdmin (ctx, redirect) {
  if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), 'admin')) {
    Session.delete("showingOtherUser");
    Session.delete("showingUserId");
    redirect('/');
  }
}

function redirectIfNotLeader (ctx, redirect) {
  if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), 'leader')) {
    Session.delete("showingOtherUser");
    Session.delete("showingUserId");
    redirect('/');
  }
}

function redirectIfAdmin (ctx, redirect) {
  if (Roles.userIsInRole(Meteor.userId(), 'admin')) {
    redirect('/admin')
  }
}

FlowRouter.subscriptions = function() {
  this.register('userEverywhere', Meteor.subscribe('userEverywhere'));
};

FlowRouter.route( '/', {
  name: 'home',
  triggersEnter: [redirectIfAdmin],
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

FlowRouter.route( '/reset-password/:token', {
  name: 'resetPassword',
  action() {
    BlazeLayout.render( 'login', { login: 'ResetPassword', footer: "Footer" } );
  }
});

FlowRouter.route( '/fundraising', {
  name: 'fundraising',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "FundraisingPage", footer: "Footer" });
  }
});

FlowRouter.route( '/profile', {
  name: 'profile',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Profile", footer: "Footer" });
  }
});

FlowRouter.route( '/forms', {
  name: 'forms',
  action() {
    BlazeLayout.render('main', { top: "Header", main: "FormsPage", footer: "Footer" });
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

FlowRouter.route( '/admin/showuserhome', {

  name: 'adminShowUserHome',
  triggersEnter: function( context, redirect ) {
    redirectIfNotAdmin(context, redirect);
  },
  action() {
    BlazeLayout.render('main', { top: "Header", main: "ShowUserHome", footer: "Footer" });
  }
});

FlowRouter.route( '/admin/print-all/:tripId', {
  name: 'print-all',
  triggersEnter: function ( context, redirect ) {
    redirectIfNotAdmin(context, redirect);
  },
  action() {
    BlazeLayout.render('main', { top: "Header", main: "PrintAll", footer: "Footer" });
  }
});

FlowRouter.route( '/admin/print-passport-images/:tripId', {
  name: 'print-passport-images',
  triggersEnter: function ( context, redirect ) {
    redirectIfNotAdmin(context, redirect);
  },
  action() {
    BlazeLayout.render('main', { top: "Header", main: "PrintPassportImages", footer: "Footer" });
  }
});

FlowRouter.route( '/admin/edit/:tripId', {
  name: 'admin-edit-trip',
  triggersEnter: function ( context, redirect ) {
    Session.set("tripId", Number(context && context.params.tripId));
    redirectIfNotAdmin(context, redirect);
  },
  action() {
    BlazeLayout.render('main', { top: "Header", main: "EditTrip", footer: "Footer" });
  }
});

FlowRouter.route( '/admin/print-one', {
  name: 'print-one',
  triggersEnter: function ( context, redirect ) {
    Session.set("showingOtherUser", true);
    Session.set( 'showingUserId', context && context.queryParams.id);
    redirectIfNotAdmin(context, redirect);
  },
  action() {
    BlazeLayout.render('main', { top: "Header", main: "PrintOne", footer: "Footer" });
  }
});

// Leader routes

FlowRouter.route( '/leader', {
  name: 'leader',
  triggersEnter: [redirectIfNotLeader],
  action() {
    BlazeLayout.render('main', { top: "Header", main: "Leader", footer: "Footer" });
  }
});

FlowRouter.route( '/leader/verify-forms/:userId', {
  name: 'verify-forms',
  triggersEnter: function(context, redirect){
    Session.set("userId", context && context.params.userId);
    redirectIfNotLeader(context, redirect);
  },
  action() {
    BlazeLayout.render('main', { top: "Header", main: "VerifyForms", footer: "Footer" });
  }
});

FlowRouter.notFound = {
  name: 'not-found',
  action: function() {
    BlazeLayout.render('main', { top: "Header", main: "NotFound", footer: "Footer" });
  }
};