import {getDTSplitData, http_get_donortools} from '/imports/api/utils';

Meteor.methods({
  'delete.passportPhoto'() {
    logger.info("Got to delete.passportPhoto");

    if ( this.userId ) {
      Images.remove({ userId: this.userId });
    } else {
      throw new Meteor.Error('delete.passportPhoto.unauthorized',
        'Cannot delete a passport photo without permission');
    }
  },
  'update.form'(formInfo, updateThisId){
    check( formInfo, {
      'formName':   String,
      'form':       [{name: String, value: String}],
    } );
    check(updateThisId, Match.Maybe(String));
    let userId;

    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      logger.info( "Got to update.form as an admin user" );
      if(updateThisId) {
        logger.info( "There was a updateThisId param passed in and it was: ", updateThisId );
        userId = updateThisId;
      } else {
        userId = this.userId;
      }
    } else if ( this.userId ) {
      logger.info( "Got to update.form as a standard user" );
      userId = this.userId;
    } else {
      return;
    }
    Forms.upsert( { userId, formName: formInfo.formName }, {
      userId,
      formName:  formInfo.formName,
      form:      formInfo.form,
      updatedOn: new Date()
    } );
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
    logger.info("Started update.splits with fundId: ", fundId);
    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      this.unblock();
      const splitData = getDTSplitData( fundId );
      logger.info( splitData );
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
    logger.info("Started form.agree with formName: ", formName);
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
  'form.tripRegistration'(tripId, updateThisId){
    check(tripId, String);
    check(updateThisId, Match.Maybe(String));

    logger.info("Started form.tripRegistration with tripId: ", tripId);
    let userId;

    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      logger.info( "Got to form.tripRegistration as an admin user" );
      if(updateThisId) {
        logger.info( "There was a updateThisId param passed in and it was: ", updateThisId );
        userId = updateThisId;
      } else {
        userId = this.userId;
      }
    } else if ( this.userId ) {
      logger.info( "Got to update.form as a standard user" );
      userId = this.userId;
    } else {
      return;
    }
    Forms.upsert( { userId, formName: 'tripRegistration' }, {
      userId,
      formName:     'tripRegistration',
      tripId:       Number( tripId ),
      registeredOn: new Date()
    } );
  },
  /**
   * Admin method to check DonorTools for a tripId and then add the trip if it exists
   *
   * @method add.trip
   * @param {String} tripId
   */
  'add.trip'(tripId){
    check(tripId, String);
    logger.info("Started add.trip with tripId: ", tripId);

    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      let collecitonTrip = Trips.findOne({tripId: Number(tripId)});
      logger.info(collecitonTrip);
      if(collecitonTrip){
        throw new Meteor.Error(400,
          'This tripId already exists in the trips collection');
      }
      this.unblock();

      let DTTrip = http_get_donortools("settings/funds/" + tripId + ".json");
      if(DTTrip && DTTrip.statusCode === 200){
        DTTrip = DTTrip.data.fund;
      } else {
        throw new Meteor.Error(DTTrip.statusCode,
          'There was a problem contacting Donor Tools or getting a result from them');
      }
      Trips.insert( {
        adminId:    this.userId,
        name:       DTTrip.name,
        tripId:     DTTrip.id,
        createdOn:  new Date(),
        raised:     DTTrip.raised.cents
      } );

      return DTTrip;
    }
  },
  /**
   * Admin method to check DonorTools for a tripId and then add the trip if it exists
   *
   * @method add.trip
   * @param {Object} deadlines
   * @param {String} deadlines.amount
   * @param {String} deadlines.due
   * @param {String} deadlines.name
   * @param {String} tripId
   */
  'add.deadline'(deadlines, tripId){
    console.dir(deadlines);
    check(deadlines, [{
        amount: String,
        due: String,
        name: String
      }]);
    check(tripId, String);
    logger.info( "Started add.trip with tripId: ", deadlines, tripId );

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      deadlines.forEach(function ( deadline, index ) {
        Deadlines.upsert({tripId: Number(tripId), deadlineNumber: index+1}, {
          deadlineNumber: index+1,
          tripId: Number(tripId),
          amount: Number(deadline.amount),
          due:    deadline.due,
          name:   deadline.name
        });
      });
      return 'Inserted all deadlines'
    }
  }
});