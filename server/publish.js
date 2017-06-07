Meteor.publish('userEverywhere', function(){
  if( this.userId) {
    return Meteor.users.find(this.userId,
      {
        fields: {
          services: 0
        }
      });
    }
});

Meteor.publish('Deadlines', function(userId){
  check(userId, Match.Maybe(String));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      if(userId) {
        let tripForm = Forms.findOne( {
          userId,
          name: 'tripRegistration',
          archived: { $ne: true }
        } );
        if( tripForm && tripForm.tripId ) {
          let tripId = tripForm.tripId;
          return Deadlines.find( { tripId } );
        }
      }
      return Deadlines.find();
    } else {
      let tripForm = Forms.findOne( {
        userId:   this.userId,
        name: 'tripRegistration',
        archived: { $ne: true }
      } );
      if( tripForm && tripForm.tripId ) {
        let tripId = tripForm.tripId;
        return Deadlines.find( { tripId } );
      }
    }
  }
});

Meteor.publish('TripDeadlines', function(tripId){
  check(tripId, Number);
  if( Roles.userIsInRole(this.userId, 'admin') ){
    return Deadlines.find( { tripId } );
  } else if( Roles.userIsInRole(this.userId, 'leader') ){
    const leaderUser = Meteor.users.findOne(this.userId);
    if(leaderUser.tripId === tripId){
      return Deadlines.find( { tripId } );
    }
    return;
  }
});

Meteor.publish('DTSplits', function(){
  console.log(this.userId);
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      return DTSplits.find();
    } else {
      let user = Meteor.users.findOne({_id: this.userId });
      if( user && user.tripId ) {
        let name = Meteor.users.findOne( { _id: this.userId } ).profile &&
          (Meteor.users.findOne( { _id: this.userId } ).profile.firstName + " " + Meteor.users.findOne( { _id: this.userId } ).profile.lastName);

        return DTSplits.find( {$and: [{ fund_id: user.tripId }, {$text: { $search: '\"' + name + '\"', $caseSensitive: false} }]} );
      }
    }
  }
});

Meteor.publish('Forms', function(userId){
  check(userId, Match.Maybe(String));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      if( userId ) {
        return Forms.find( { userId, archived: { $ne: true } } );
      } else {
        return Forms.find( { archived: { $ne: true } } );
      }
    } else if( Roles.userIsInRole(this.userId, 'leader') ){
      const leaderUser = Meteor.users.findOne(this.userId);
      if( userId ) {
        const tripUser = Meteor.users.findOne(userId);
        if(leaderUser.tripId === tripUser.tripId){
          return Forms.find( { userId, archived: { $ne: true } } );
        }
      }
    }
    console.log("not an admin or leader")
    return Forms.find( { userId: this.userId, archived: { $ne: true } } );
  }
});

Meteor.publish('files.images', function (showingUserId, showingTripId) {
  check(showingUserId, Match.Maybe(String));
  check(showingTripId, Match.Maybe(Number));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ) {
      if(showingUserId){
        return Images.find({userId: showingUserId}).cursor;
      } else {
        // get the users in this trip, then return all of their images
        const users = Meteor.users.find({tripId: showingTripId}).map(function (user) {
          return user._id;
        });
        return Images.find({userId: {$in: users } }).cursor;
      }
    } else if( Roles.userIsInRole(this.userId, 'leader') && showingTripId) {
      const users = Meteor.users.find({tripId: showingTripId}).map(function (user) {
        return user._id;
      });
      return Images.find( { userId: {$in: users} } ).cursor;
    }
    return Images.find( { userId: this.userId } ).cursor;
  }
});

Meteor.publish('Images', function () {
  if( Roles.userIsInRole(this.userId, 'admin') ) {
    return Images.find().cursor;
  }
});

Meteor.publish('Trips', function(tripId){
  check(tripId, Match.Maybe(Number));
  logger.info("Started to publish Trips with: " + tripId);

  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      if(tripId) return Trips.find({tripId});
      else return Trips.find();
    } else if( Roles.userIsInRole(this.userId, 'leader') ){
      if(tripId && (tripId === Meteor.users.findOne({_id: this.userId}).tripId) ) {
        return Trips.find({tripId});
      } else {
        let user = Meteor.users.findOne( { _id: this.userId } );
        let thisTripId = user && user.tripId;
        if( thisTripId ) return Trips.find( { tripId: thisTripId } );
      }
    } else {
      let user = Meteor.users.findOne( { _id: this.userId } );
      let thisTripId = user && user.tripId;
      if( thisTripId ) return Trips.find( { tripId: thisTripId } );
    }
  }
});

Meteor.publish('users', function(){
  logger.info("Started to publish users");

  if( this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Meteor.users.find({},
      {
        fields: {
          services: 0
        }
      });
  }
});

Meteor.publish('user', function(userId){
  check(userId, Match.Maybe(String));
  logger.info("Started to publish user with: " + userId);

  if( this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    if(userId) {
      return Meteor.users.find({_id: userId},
        {
          fields: {
            services: 0
          }
        });
    }
  } else if( Roles.userIsInRole(this.userId, 'leader') && userId ){
    const leaderUser = Meteor.users.findOne(this.userId);
    const tripUser = Meteor.users.findOne(userId);
    if(leaderUser && tripUser && (leaderUser.tripId === tripUser.tripId) ){
      return Meteor.users.find({_id: userId},
        {
          fields: {
            services: 0
          }
        });
    } else {
      return;
    }
  }
});

Meteor.publishComposite("TripLeader", function(tripId) {
  logger.info("Started publish function, TripLeader with tripId: " + tripId);
  check(tripId, Number);
  if( Roles.userIsInRole(this.userId, ['admin', 'leader']) ){
    return {
      find: function() {
        return Meteor.users.find({tripId});
      },
      children: [
        {
          find: function( user ) {
            // Find the charges associated with this customer
            const forms =  Forms.find( { userId: user._id, archived: { $ne: true } } );
            return forms;
          }
        },
        {
          find: function(  ) {
            // Find the subscriptions associated with this customer
            const splits = DTSplits.find( { fund_id: tripId } );
            return splits;
          }
        }
      ]
    };
  }
});

