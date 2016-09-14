Meteor.methods({
  'delete.passportPhoto'() {
    console.log("Got to delete.passportPhoto");

    if ( this.userId ) {
      Images.remove({ userId: this.userId });
    } else {
      throw new Meteor.Error('delete.passportPhoto.unauthorized',
        'Cannot delete a passport photo without permission');
    }
  },
  'update.form'(formInfo){
    check( formInfo, {
      'formName':   String,
      'form':       [{name: String, value: String}],
    } );
    if ( this.userId ) {
      console.log( "Got to update.form" );
      console.dir( formInfo );
      Forms.upsert( { userId: this.userId, formName: formInfo.formName }, {
        userId:    this.userId,
        formName:  formInfo.formName,
        form:      formInfo.form,
        updatedOn: new Date()
      } );
    }
  },
  /**
   * Get the Donor Tools split data and expand that to include the donation
   * and person objects
   *
   * @method update.splits
   * @param {Number} fundId
   */
  'update.splits'(fundId){
    check(fundId, Number);
    console.log("Started update.splits with fundId: ", fundId);
    if ( this.userId ) {
      this.unblock();
      import {getDTSplitData} from '/imports/api/utils';
      const splitData = getDTSplitData( fundId );
      console.log( splitData );
    }
  },
  /**
   * Change the agreement status for a simple agree form
   *
   * @method form.agree
   * @param {String} formName
   */
  'form.agree'(formName){
    check(formName, String);
    console.log("Started form.agree with formName: ", formName);
    if ( this.userId ) {
      this.unblock();

      Forms.upsert( { userId: this.userId, formName: formName }, {
        userId:     this.userId,
        formName:   formName,
        agreed:     true,
        agreedDate: new Date()
      } );

      return 'Form inserted';
    }
  },
  /**
   * User method to register for a trip
   *
   * @method form.tripRegistration
   * @param {String} tripId
   */
  'form.tripRegistration'(tripId){
    check(tripId, String);
    console.log("Started form.tripRegistration with tripId: ", tripId);

    if ( this.userId ) {
      this.unblock();
      Forms.upsert( { userId: this.userId, formName: 'tripRegistration' }, {
        userId:       this.userId,
        formName:     'tripRegistration',
        tripId:       Number( tripId ),
        registeredOn: new Date()
      } );

      return 'Form inserted';
    }
  }
});