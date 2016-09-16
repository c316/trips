Meteor.publish({
  'Deadlines'(){
    if( this.userId ) {
      if( Roles.userIsInRole(this.userId, 'admin') ){
        return Deadlines.find();
      } else {
        let tripForm = Forms.findOne( {
          userId:   this.userId,
          formName: 'tripRegistration'
        } );
        if( tripForm && tripForm.tripId ) {
          let tripId = tripForm.tripId;
          return Deadlines.find( { tripId } );
        }
      }
    }
  },
  'DTSplits'(){
    if( this.userId ) {
      if( Roles.userIsInRole(this.userId, 'admin') ){
        return DTSplits.find();
      } else {
        let tripForm = Forms.findOne( {
          userId:   this.userId,
          formName: 'tripRegistration'
        } );
        if( tripForm && tripForm.tripId ) {
          let name = Meteor.users.findOne( { _id: this.userId } ).profile &&
            (Meteor.users.findOne( { _id: this.userId } ).profile.firstName + " " + Meteor.users.findOne( { _id: this.userId } ).profile.lastName);
          return DTSplits.find( { fund_id: tripForm.tripId, memo: name } );
        }
      }
    }
  },
  'Forms'(){
    if( this.userId ) {
      if( Roles.userIsInRole(this.userId, 'admin') ){
        return Forms.find();
      } else {
        return Forms.find( { userId: this.userId } );
      }
    }
  },
  'files.images'() {
    if( this.userId ) {
      if( Roles.userIsInRole(this.userId, 'admin') ) {
        return Images.find().cursor;
      } else {
        return Images.find( { userId: this.userId } ).cursor;
      }
    }
  },
  'Trips'(){
    if( this.userId ) {
      if( Roles.userIsInRole(this.userId, 'admin') ){
        return Trips.find();
      } else {
        let user = Meteor.users.findOne( { _id: this.userId } );
        let tripId = user && user.trip && user.trip.id;
        if( tripId ) return Trips.find( { tripId: tripId } );
      }
    }
  },
  'users'(){
    if( this.userId && Roles.userIsInRole(this.userId, 'admin')) {
      return Meteor.users.find();
    }
  },
  'user'(userId){
    check(userId, String);
    if( this.userId && Roles.userIsInRole(this.userId, 'admin')) {
      if(userId) return Meteor.users.find({_id: userId});
      else return Meteor.users.find();
    }
  }
});