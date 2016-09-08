Meteor.publish({
  'files.images'() {
    if( this.userId ) {
      return Images.find( { userId: this.userId } ).cursor;
    }
  },
  'forms'(){
    if( this.userId ) {
      return Forms.find( { userId: this.userId } );
    }
  }
});