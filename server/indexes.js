Meteor.startup(function() {
  Audit_trail._ensureIndex({ category: 1 });
  Audit_trail._ensureIndex({ type: 1 });
  Audit_trail._ensureIndex({ subtype: 1 });
  Audit_trail._ensureIndex({ show: 1 });
  Audit_trail._ensureIndex({ relatedCollection: 1 });
  Audit_trail._ensureIndex({ relatedDoc: 1 });
  Audit_trail._ensureIndex({ userId: 1 });

  DTSplits._ensureIndex({ memo: 'text' });
  DTSplits._ensureIndex({ donation_id: 1 });
  DTSplits._ensureIndex({ fund_id: 1 });
  DTSplits._ensureIndex({ 'donation.id': 1 });
  DTSplits._ensureIndex({ 'donation.persona_id': 1 });
  DTSplits._ensureIndex({ 'donation.transaction_id': 1 });
  DTSplits._ensureIndex({ 'persona.id': 1 });

  Meteor.users._ensureIndex({ 'emails.address': 1 });
  Meteor.users._ensureIndex({ 'profile.fname': 1 });
  Meteor.users._ensureIndex({ 'profile.lname': 1 });
  Meteor.users._ensureIndex({ 'profile.business_name': 1 });
  Meteor.users._ensureIndex({ primary_customer_id: 1 });
  Meteor.users._ensureIndex({ 'emailSubscriptions.id': 1 });
  Meteor.users._ensureIndex({ 'emailSubscriptions.isActive': 1 });

  Trips._ensureIndex({ fundId: 1 });
  Trips._ensureIndex({ name: 1 });
});
