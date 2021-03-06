Meteor.publish('userEverywhere', function() {
  if (this.userId) {
    return Meteor.users.find(this.userId, {
      fields: {
        services: 0,
      },
    });
  }
});

Meteor.publish('Deadlines', function(userId) {
  check(userId, Match.Maybe(String));
  if (this.userId) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      if (userId) {
        const tripForm = Forms.findOne({
          userId,
          name: 'tripRegistration',
          archived: { $ne: true },
        });
        if (tripForm && tripForm.tripId) {
          const tripId = tripForm.tripId;
          return Deadlines.find({ tripId });
        }
      }
      return Deadlines.find();
    }
    const tripForm = Forms.findOne({
      userId: this.userId,
      name: 'tripRegistration',
      archived: { $ne: true },
    });
    if (tripForm && tripForm.tripId) {
      const tripId = tripForm.tripId;
      return Deadlines.find({ tripId });
    }
  }
});
Meteor.publish('DeadlineAdjustments', function(userId) {
  check(userId, Match.Maybe(String));
  if (this.userId) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      if (userId) {
        const user = Meteor.users.findOne({ _id: userId });
        return DeadlineAdjustments.find({
          userId,
          tripId: user.tripId,
        });
      }
      return DeadlineAdjustments.find();
    }
    const user = Meteor.users.findOne({ _id: this.userId });
    return DeadlineAdjustments.find({
      userId: this.userId,
      tripId: user.tripId,
    });
  }
});

Meteor.publish('TripDeadlines', function(tripId) {
  check(tripId, Number);
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return Deadlines.find({ tripId });
  } else if (Roles.userIsInRole(this.userId, 'leader')) {
    const leaderUser = Meteor.users.findOne(this.userId);
    if (leaderUser.tripId === tripId) {
      return Deadlines.find({ tripId });
    }
  }
});

Meteor.publish('DTSplits', function() {
  if (this.userId) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      return DTSplits.find();
    }
    const user = Meteor.users.findOne({ _id: this.userId });
    if (user && user.tripId) {
      const name =
        Meteor.users.findOne({ _id: this.userId }).profile &&
        `${Meteor.users.findOne({ _id: this.userId }).profile.firstName} ${
          Meteor.users.findOne({ _id: this.userId }).profile.lastName
        }`;

      return DTSplits.find({
        $and: [
          { fund_id: user.tripId },
          { $text: { $search: `"${name}"`, $caseSensitive: false } },
        ],
      });
    }
  }
});

Meteor.publish('Forms', function(userId) {
  check(userId, Match.Maybe(String));
  if (this.userId) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      if (userId) {
        return Forms.find({ userId, archived: { $ne: true } });
      }
      return Forms.find({ archived: { $ne: true } });
    } else if (Roles.userIsInRole(this.userId, 'leader')) {
      const leaderUser = Meteor.users.findOne(this.userId);
      if (userId) {
        const tripUser = Meteor.users.findOne(userId);
        if (leaderUser.tripId === tripUser.tripId) {
          return Forms.find({ userId, archived: { $ne: true } });
        }
      }
    }
    console.log('not an admin or leader');
    return Forms.find({ userId: this.userId, archived: { $ne: true } });
  }
});

Meteor.publish('files.images', function(showingUserId, showingTripId) {
  check(showingUserId, Match.Maybe(String));
  check(showingTripId, Match.Maybe(Number));
  if (this.userId) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      if (showingUserId) {
        return Images.find({ userId: showingUserId }).cursor;
      }
      // get the users in this trip, then return all of their images
      const users = Meteor.users
        .find({ tripId: showingTripId })
        .map(function(user) {
          return user._id;
        });
      return Images.find({ userId: { $in: users } }).cursor;
    } else if (Roles.userIsInRole(this.userId, 'leader') && showingTripId) {
      const users = Meteor.users
        .find({ tripId: showingTripId })
        .map(function(user) {
          return user._id;
        });
      return Images.find({ userId: { $in: users } }).cursor;
    }
    return Images.find({ userId: this.userId }).cursor;
  }
});

Meteor.publish('Images', function() {
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return Images.find().cursor;
  }
});

Meteor.publish('Trips', function(tripId, showExpired) {
  check(tripId, Match.Maybe(Number));
  check(showExpired, Match.Maybe(Boolean));
  logger.info(
    'Started to publish Trips with tripId:',
    tripId,
    'and showExpired:',
    showExpired,
  );

  if (this.userId) {
    if (Roles.userIsInRole(this.userId, 'admin')) {
      const query = {};
      if (!showExpired) {
        query.expires = {};
        query.expires.$gte = new Date();
      }
      if (tripId) {
        return Trips.find({ tripId });
      }
      return Trips.find(query);
    } else if (Roles.userIsInRole(this.userId, 'leader')) {
      if (
        tripId &&
        tripId === Meteor.users.findOne({ _id: this.userId }).tripId
      ) {
        return Trips.find({ tripId });
      }
      const user = Meteor.users.findOne({ _id: this.userId });
      const thisTripId = user && user.tripId;
      if (thisTripId) return Trips.find({ tripId: thisTripId });
    } else {
      const user = Meteor.users.findOne({ _id: this.userId });
      const thisTripId = user && user.tripId;
      if (thisTripId) return Trips.find({ tripId: thisTripId });
    }
  }
});

Meteor.publish('users', function(search, limit, tripId, allTrips) {
  logger.info('Started to publish users with these args:', {
    search,
    limit,
    tripId,
    allTrips,
  });
  check(search, Match.Maybe(String));
  check(limit, Match.Maybe(Number));
  check(tripId, Match.Maybe(Number));
  check(allTrips, Boolean);

  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    const limitValue = limit || 0;
    const searchValue = search || '';
    const options = {
      sort: { 'profile.lastName': 1, 'profile.firstName': 1 },
      limit: limitValue,
      fields: {
        services: 0,
      },
    };

    let searchObject;
    if (searchValue) {
      searchObject = {
        $or: [
          {
            'profile.firstName': {
              $regex: searchValue,
              $options: 'i',
            },
          },
          {
            'profile.lastName': {
              $regex: searchValue,
              $options: 'i',
            },
          },
          {
            'emails[0].address': {
              $regex: searchValue,
              $options: 'i',
            },
          },
          {
            id: {
              $regex: searchValue,
            },
          },
        ],
      };
    } else {
      searchObject = {};
    }

    if (tripId) {
      searchObject = {
        $and: [{ tripId }, searchObject],
      };
    }
    if (!tripId && !searchValue && !allTrips) {
      return null;
    }
    return Meteor.users.find(searchObject, options);
  }
});

Meteor.publish('user', function(userId) {
  check(userId, Match.Maybe(String));
  logger.info(`Started to publish user with: ${userId}`);

  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    if (userId) {
      return Meteor.users.find(
        { _id: userId },
        {
          fields: {
            services: 0,
          },
        },
      );
    }
  } else if (Roles.userIsInRole(this.userId, 'leader') && userId) {
    const leaderUser = Meteor.users.findOne(this.userId);
    const tripUser = Meteor.users.findOne(userId);
    if (leaderUser && tripUser && leaderUser.tripId === tripUser.tripId) {
      return Meteor.users.find(
        { _id: userId },
        {
          fields: {
            services: 0,
          },
        },
      );
    }
  }
});

Meteor.publishComposite('TripLeader', function(tripId) {
  logger.info(`Started publish function, TripLeader with tripId: ${tripId}`);
  check(tripId, Number);
  if (Roles.userIsInRole(this.userId, ['admin', 'leader'])) {
    return {
      find() {
        return Meteor.users.find({ tripId });
      },
      children: [
        {
          find(user) {
            // Find the charges associated with this customer
            const forms = Forms.find({
              userId: user._id,
              archived: { $ne: true },
            });
            return forms;
          },
        },
        {
          find() {
            // Find the subscriptions associated with this customer
            const splits = DTSplits.find({ fund_id: tripId });
            return splits;
          },
        },
      ],
    };
  }
});
