import { Meteor } from 'meteor/meteor';
import { setupPapertrail } from '/imports/api/papertrail';

Meteor.startup(() => {
  setupPapertrail();
});
