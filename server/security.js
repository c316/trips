// ongoworks:security allow/deny rules
Security.permit(['insert', 'update', 'remove'])
  .collections(
    [
      Audit_trail,
      Forms,
      Fundraisers,
      Trips
    ])
  .ifHasRole('admin')
  .allowInClientCode();
