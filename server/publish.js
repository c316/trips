Meteor.publish('DeadlineAdjustments', function(){
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      return DeadlineAdjustments.find();
    } else {
      let user = this.user();
      if( user && user.tripId ) {
        return DeadlineAdjustments.find({userId: user._id, tripId: user.tripId});
      }
    }
  }
});

Meteor.publish('Deadlines', function(userId){
  check(userId, Match.Maybe(String));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      if(userId) {
        let tripForm = Forms.findOne( {
          userId,
          name: 'tripRegistration'
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
        name: 'tripRegistration'
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
        return DTSplits.find( {$and: [{ fund_id: user.tripId }, {$text: { $search: '\"' + name + '\"'} }]} );
      }
    }
  }
});

Meteor.publish('Forms', function(userId){
  check(userId, Match.Maybe(String));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      if( userId ) {
        return Forms.find( { userId } );
      } else {
          return Forms.find();
      }
    } else {
      return Forms.find( { userId: this.userId } );
    }
  }
});

Meteor.publish('files.images', function (showingUserId) {
  check(showingUserId, Match.Maybe(String));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ) {
      return Images.find({userId: showingUserId}).cursor;
    } else {
      return Images.find( { userId: this.userId } ).cursor;
    }
  }
});

Meteor.publish('Trips', function(tripId){
  check(tripId, Match.Maybe(Number));
  if( this.userId ) {
    if( Roles.userIsInRole(this.userId, 'admin') ){
      if(tripId) return Trips.find({tripId});
      else return Trips.find();
    } else {
      let user = Meteor.users.findOne( { _id: this.userId } );
      let thisTripId = user && user.tripId;
      if( thisTripId ) return Trips.find( { tripId: thisTripId } );
    }
  }
});

Meteor.publish('users', function(){
  if( this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Meteor.users.find();
  }
});

Meteor.publish('user', function(userId){
  check(userId, Match.Maybe(String));
  if( this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    if(userId) return Meteor.users.find({_id: userId});
    else return Meteor.users.find();
  } else if (this.userId) {
    return Meteor.users.find(this.userId, {
      fields: {
        tripId: 1
      }
    });
  }
});
