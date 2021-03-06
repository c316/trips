import { Meteor } from 'meteor/meteor';
import { setupPapertrail } from '/imports/api/papertrail';
import { updateSplits } from '/imports/api/utils';

Meteor.startup(() => {
  setupPapertrail();

  SyncedCron.remove('Get Trip Fund Data (morning)');
  SyncedCron.remove('Get Trip Fund Data (evening)');

  SyncedCron.add({
    name: 'Get Trip Fund Data (morning)',
    schedule: parser => parser.recur().on('09:00:00').time(),
    job: () => {
      logger.info('Started Get Trip Fund Data (morning) job');
      const updateTripFunds = updateSplits();
      return updateTripFunds;
    },
  });

  SyncedCron.add({
    name: 'Get Trip Fund Data (evening)',
    schedule: parser => parser.recur().on('18:00:00').time(),
    job: () => {
      logger.info('Started Get Trip Fund Data (evening) job');
      const updateTripFunds = updateSplits();
      return updateTripFunds;
    },
  });

  SyncedCron.start();
});
