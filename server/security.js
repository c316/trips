// ongoworks:security allow/deny rules
Security.permit(['insert', 'update', 'remove'])
  .collections(
    [
      Audit_trail,
      Deadlines,
      Forms,
      Fundraisers,
      Trips
    ])
  .ifHasRole('admin')
  .allowInClientCode();
