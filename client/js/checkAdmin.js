FlowRouter.wait();

Tracker.autorun(() => {
  // wait on roles to initialize so we can check is use is in proper role
  if (Roles.subscription.ready() && !FlowRouter._initialized) {
    FlowRouter.initialize();
  }
});