// ongoworks:security allow/deny rules
Security.permit(['insert', 'update', 'remove'])
  .collections([
    Audit_trail,
    Deadlines,
    Forms,
    Fundraisers,
    Meteor.users,
    Trips,
  ])
  .ifHasRole('admin')
  .allowInClientCode();
