import {getDTSplitData, http_get_donortools} from '/imports/api/utils';

Meteor.methods({
  'delete.passportPhoto'(userId) {
    check(userId, Match.Maybe(String));
    logger.info("Got to delete.passportPhoto");

    if ( Roles.userIsInRole(this.userId, 'admin') && userId) {
      Images.remove({ userId });
    } else if ( this.userId ) {
      Images.remove({ userId: this.userId });
    } else {
      throw new Meteor.Error('delete.passportPhoto.unauthorized',
        'Cannot delete a passport photo without permission');
    }
  },
  'update.form'(form, updateThisId){
    check( form, {
      "allergiesOrHealthConditions":  Match.Maybe(String),
      "beenOnATMPTrip":               Match.Maybe(String),
      "beenOnATMPTripExplained":      Match.Maybe(String),
      "beneficiaryFirstName":         Match.Maybe(String),
      "beneficiaryLastName":          Match.Maybe(String),
      "beneficiaryRelationship":      Match.Maybe(String),
      "birthdate":                    Match.Maybe(String),
      "bloodType":                    Match.Maybe(String),
      "convictedOfACrime":            Match.Maybe(String),
      "convictedOfACrimeExplained":   Match.Maybe(String),
      "emergencyContactCity":         Match.Maybe(String),
      "emergencyContactAddressLine1": Match.Maybe(String),
      "emergencyContactAddressLine2": Match.Maybe(String),
      "emergencyContactAddressZip":   Match.Maybe(String),
      "emergencyContactFirstName":    Match.Maybe(String),
      "emergencyContactLastName":     Match.Maybe(String),
      "emergencyContactPhone":        Match.Maybe(String),
      "emergencyContactState":        Match.Maybe(String),
      "name":                         String,
      "gender":                       Match.Maybe(String),
      "homeChurchName":               Match.Maybe(String),
      "iagree":                       Match.Maybe(String),
      "iWouldLikeToParticipateIn":    Match.Maybe([String]),
      "languageProficiencyExplained": Match.Maybe(String),
      "lastTetanusShotYear":          Match.Maybe(String),
      "medicationsBeingTaken":        Match.Maybe(String),
      "opportunityDetails":           Match.Maybe(String),
      "outsideUSTravelExplained":     Match.Maybe(String),
      "passportExpirationDate":       Match.Maybe(String),
      "passportFirstName":            Match.Maybe(String),
      "passportLastName":             Match.Maybe(String),
      "passportMiddleName":           Match.Maybe(String),
      "passportStatus":               Match.Maybe(String),
      "permissionToRunBackgroundCheck":Match.Maybe(String),
      "preferredName":                String,
      "speaksOtherLanguages":         Match.Maybe(String),
      "traveledOutsideTheUS":         Match.Maybe(String),
      "tShirtSize":                   Match.Maybe(String),
      "whatThreeSkills":              Match.Maybe(String),
      "whyDoYouWantToJoinThisTeam":   Match.Maybe(String)
    } );
    check(updateThisId, Match.Maybe(String));

    function formIsComplete(form){
      let formLength = Object.keys(form).length;
      console.log(formLength);
      if(form.passportStatus && (form.passportStatus === 'yes' || form.passportStatus === 'in-progress')){
        if(formLength >= 33){
          return true;
        }
        return false;
      } else {
        return false;
      }
    }

    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      logger.info( "Got to update.form as an admin user" );
      if(updateThisId) {
        logger.info( "There was a updateThisId param passed in and it was: ", updateThisId );
        form.userId = updateThisId;
      } else {
        form.userId = this.userId;
      }
    } else if ( this.userId ) {
      logger.info( "Got to update.form as a standard user" );
      form.userId = this.userId;
    } else {
      return;
    }
    form.updatedOn = new Date();
    form.completed = formIsComplete(form);
    Forms.upsert( { userId: form.userId, name: form.name }, form );
  },
  /**
   * Get the Donor Tools split data and expand that to include the donation
   * and person objects
   *
   * @method update.splits
   * @param {Number} fundId
   */
  'update.splits'(fundId){
    check(fundId, Match.Maybe(Number));
    logger.info("Started update.splits with fundId: ", fundId ? fundId : "All funds");
    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      this.unblock();
      let splitData;
      if(!fundId){
        let trips = Trips.find({expires: {$gte: new Date()}}).map(function ( trip ) {
          return getDTSplitData( trip.tripId );
        });
        splitData = trips;
      } else {
        splitData = getDTSplitData( fundId );
      }
      logger.info( splitData );
      return splitData && 'success';
    }
  },
  /**
   * Change the agreement status for a simple agree form
   *
   * @method form.agree
   * @param {String} name
   */
  'form.agree'(name){
    check(name, String);
    logger.info("Started form.agree with name: ", name);
    if ( this.userId ) {
      this.unblock();

      Forms.upsert( { userId: this.userId, name }, {
        userId:     this.userId,
        name,
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
    let trip = Trips.findOne({tripId: Number(tripId)});
    if(trip && trip._id){
      Forms.upsert( { userId, name: 'tripRegistration' }, {
                      userId,
        name:     'tripRegistration',
        tripId:       Number( tripId ),
        registeredOn: new Date()
      } );

      Meteor.users.update({_id: userId}, {$set: {tripId: Number( tripId )}});
      Roles.addUsersToRoles(userId, 'trip-member');

      if(Meteor.settings.Give && Meteor.settings.Give.tripsManagerPassword) {
        let user = Meteor.users.findOne(userId);
        let tripMemberData = {
          fname:  user.profile.firstName,
          lname:  user.profile.lastName,
          email:  user.emails[0].address,
          fundId: tripId
        };
        Meteor.call( "runGiveMethod", "insertFundraisersWithTrip", tripMemberData, function ( err, res ) {
          if( err ) {
            logger.error( err );
          } else {
            logger.info( res );
          }
        } );
      }

    } else {
      throw new Meteor.Error(400, "Hmmm...I couldn't find that trip, ask your Trip coordinator if this is the right ID.");
    }
  },
  /**
   * Admin method to check DonorTools for a tripId and then add the trip if it exists
   *
   * @method add.trip
   * @param {String} tripId - The DonorTools fund id
   * @param {Object} data
   * @param {String} data.showFundraisingModule - Should we show the fundraising module to trip participants? Should we show the trip on the Give page?
   * @param {String} data.tripEndDate - What is the last day of the mission trip?
   * @param {String} data.tripExpirationDate - When should this trip stop appearing in the admin module and on the Give page?
   * @param {String} data.tripStartDate - What is the first day of the mission trip?
   */
  'add.trip'(tripId, data){
    check(tripId, String);
    check(data, {
      showFundraisingModule: Boolean,
      tripEndDate: Date,
      tripExpirationDate: Date,
      tripStartDate: Date
    });
    logger.info("Started add.trip with data: ", tripId, data);

    if ( Roles.userIsInRole(this.userId, 'admin') ) {
      let tripCollection = Trips.findOne({tripId: Number(tripId)});
      logger.info(tripCollection);
      if(tripCollection){
        throw new Meteor.Error(400,
          'This tripId already exists in the trips collection');
      }
      //this.unblock();

      let DTTrip = http_get_donortools("settings/funds/" + tripId + ".json");
      if(DTTrip && DTTrip.statusCode === 200){
        DTTrip = DTTrip.data.fund;
      } else {
        throw new Meteor.Error(DTTrip.statusCode,
          'There was a problem contacting Donor Tools or getting a result from them, try again in a little while, then contact the admin if you are still having trouble');
      }

      Trips.insert( {
        adminId:                this.userId,
        createdOn:              new Date(),
        expires:                new Date(data.tripExpirationDate),
        starts:                 new Date(data.tripStartDate),
        ends:                   new Date(data.tripEndDate),
        name:                   DTTrip.name,
        raised:                 DTTrip.raised.cents,
        tripId:                 DTTrip.id,
        showFundraisingModule:  data.showFundraisingModule
      } );

      if(Meteor.settings.Give && Meteor.settings.Give.tripsManagerPassword) {
        let tripData = {
          active:         true,
          fundId:         DTTrip.id.toString(),
          fundTotal:      DTTrip.raised.cents,
          endDate:        new Date(data.tripEndDate),
          expires:        new Date(data.tripExpirationDate),
          startDate:      new Date(data.tripStartDate),
          show:           data.showFundraisingModule
        };
        Meteor.call("runGiveMethod", "insertTrip", tripData, function ( err, res ) {
          if(err) {
            logger.error(err);
          } else {
            logger.info(res);
          }
        } );
      }

      return DTTrip && 'success';
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
    logger.info( "Started add.trip with data: ", deadlines, tripId );

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      deadlines.forEach(function ( deadline, index ) {
        Deadlines.upsert({tripId: Number(tripId), deadlineNumber: index+1}, {
          deadlineNumber: index+1,
          tripId: Number(tripId),
          amount: Number(deadline.amount),
          due:    new Date(deadline.due),
          name:   deadline.name
        });
      });
      return 'Inserted all deadlines'
    }
  },
  /**
   * Admin method to update the deadline adjustment for a user's trip deadline
   *
   * @method update.user.deadline
   * @param {Object} deadlines
   * @param {String} deadlines.adjustmentAmount
   * @param {String} userId
   */
  'update.user.deadline'(deadlines, userId, tripId){
    check( deadlines, [{
      adjustmentAmount: String,
      deadlineId: String,
    }] );
    check(userId, String);
    check(tripId, Number);

    logger.info( "Started update.user.deadline with data: ", deadlines );

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      deadlines.forEach(function ( deadline, index ) {
        DeadlineAdjustments.upsert({tripId, userId, deadlineId: deadline.deadlineId}, {
          adjustmentAmount: Number(deadline.adjustmentAmount),
          deadlineId:       deadline.deadlineId,
          tripId,
          userId,
        });
      });
    }
  },
  /**
   * Admin method to export a collection to a CSV format
   *
   * @method export.formByTrip
   * @param {String} tripId
   */
  'export.formByTrip'(tripId){
    check(tripId, Number);
    logger.info( "Started export.formByTrip with tripId: ", tripId );

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      import Papa from 'papaparse';
      let usersOnThisTrip = Meteor.users.find({tripId: tripId}).map(function(user){return user._id});
      if(usersOnThisTrip && usersOnThisTrip.length > 0){
        let collection = Forms.find({name: 'missionaryInformationForm', userId: {$in: usersOnThisTrip}}).fetch();
        logger.info("Exporting ", collection.length, "records from trip ", tripId);

        if(collection && collection.length > 0){
          logger.info("Using Papa Parse to unparse those docs");
          logger.info(collection);

          // TODO: iterate over this list and use Object.keys
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
          // to get all the keys for each of these, push them
          // to an array
          // then use _.uniq (http://underscorejs.org/#uniq) to get the list of just the uniq keys,
          // then use this new array for the header so that you end up with all of the header labels you need
          // for the CSV

          return Papa.unparse(collection, {header: true});
        } else {
          throw new Meteor.Error( 400, 'No MIFs for that trip have been started.' );
        }
      } else {
        throw new Meteor.Error( 400, 'No users are registered for that trip.' );
      }
    }
  },
  /**
   * Super-admin method to add a new role to a user
   *
   * @method add.roleToUser
   * @param {String} userId
   * @param {String} role
   */
  'add.roleToUser'(userId, role){
    check(userId, String);
    check(role, String);
    logger.info( "Started add.roleToUser with user: " + userId + " and role: ", role );

    if( Roles.userIsInRole( this.userId, 'super-admin' ) ) {
      return Roles.addUsersToRoles(userId, role);
    } else {
      throw new Meteor.Error( 400, 'Need to have the proper permission to do this' );
    }
  },
  /**
   * Runs a Give method
   *
   * @method runGiveMethod
   */
  'runGiveMethod'(method, args){
    check(method, String);
    check(args, Match.Maybe(Object));

    logger.info( "Started DDP connection with the runGiveMethod method with: " + method );
    if( (Roles.userIsInRole( this.userId, ['super-admin', 'admin'] ) ) ||
      ( method === "insertFundraisersWithTrip" && Roles.userIsInRole( this.userId, 'trip-member' ) ) ||
      ( method === "updateFundraiserName" && Roles.userIsInRole( this.userId, 'trip-member' )) ) {
      import { connectToGive } from '/imports/api/utils';
      if(args){
        connectToGive().call(method, args, function ( err, res ) {
          if(err) {
            console.error(err);
          } else {
            console.log(res);
            connectToGive().disconnect();
          }
        });
      } else {
        connectToGive().call(method, function ( err, res ) {
          if(err) {
            console.error(err);
          } else {
            console.log(res);
            connectToGive().disconnect();
          }
        });
      }
    } else {
      throw new Meteor.Error( 403, 'You need to have the proper permission to do this' );
    }
  },
  /**
   * Checks for expired image URLs and updates them
   *
   * @method updateExpiredSignedURLS
   */
  'updateExpiredSignedURLS'(){
    if( this.userId ) {
      import knox from 'knox';
      import { getSignedURLs } from '/imports/api/miscFunctions';
      var client = knox.createClient({
        key: Meteor.settings.AWS.key,
        secret: Meteor.settings.AWS.secret,
        bucket: Meteor.settings.AWS.bucket,
        region: Meteor.settings.AWS.region
      });
      let images;

      logger.info( "Started updateExpiredSignedURLS method with user: " + this.userId, );
      if( Roles.userIsInRole( this.userId, 'admin' ) ) {
        images = Images.find().cursor;
      } else {
        images = Images.find( { userId: this.userId } ).cursor;
      }
      images.forEach(function ( image ) {
        let date = new Date();
        let time = date.getTime();
        if (time > (image.versions &&
          image.versions.original &&
          image.versions.original.meta &&
          image.versions.original.meta.expires) ) {
          logger.info("this image has expired, updating signed expiration");

          getSignedURLs(client, 'thumbnail', image._id, function(err, res){
            if (err) logger.error(err);
            else logger.log(res);
          });
          getSignedURLs(client, 'original', image._id, function(err, res){
            if (err) logger.error(err);
            else logger.log(res);
          });
        }
      });
    }
  },
  /**
   * Since users can't update their profile on the client side this method does this for them.
   *
   * @method updateUserDoc
   */
  updateUserDoc(formData){
    check( formData, {
      "firstName": String,
      "lastName":  String,
      "phone":     String,
      "address":   {
        "address": String,
        "city":    String,
        "state":   String,
        "zip":     String
      }
    } );
    logger.info( "Started updateUserDoc method with user: " + this.userId, );

    return Meteor.users.update( { _id: this.userId }, { $set: { profile: formData } } );
  },
  /**
   * This method inserts a deadline and shifts the existing deadlines around so they are still in date order
   *
   * @method insert.deadline
   */
  'insert.deadline'(deadline, tripId){
    check( deadline, {
      "name":     String,
      "amount":   Number,
      "due":      Date,
    } );
    check(tripId, Number);

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      deadline.tripId = tripId;
      console.log(deadline);
      logger.info( "Started insert.deadline method with user: " + this.userId );
      let deadlines = Deadlines.find({tripId: tripId}).fetch();
      deadlines.push(deadline);
      deadlines = _.sortBy( deadlines, 'due' );
      deadlines.forEach(function ( deadline, index ) {
        if(deadline._id){
          Deadlines.update({_id: deadline._id}, {
            deadlineNumber: index+1,
            tripId: Number(tripId),
            amount: Number(deadline.amount),
            due:    deadline.due,
            name:   deadline.name
          });
        } else {
          Deadlines.insert({
            deadlineNumber: index+1,
            tripId: Number(tripId),
            amount: Number(deadline.amount),
            due:    deadline.due,
            name:   deadline.name
          });
        }
      });
    } else {
      throw new Meteor.Error( 403, 'You need to have the proper permission to do this' );
    }

  },
  /**
   * This method updates an existing deadline
   *
   * @method update.deadline
   */
  'update.deadline'(deadline){
    check( deadline, {
      "_id":     String,
      "amount":  Number,
      "due":     Date,
      "name":    String,
      "tripId":  Number
    } );

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      console.log(deadline);
      logger.info( "Started update.deadline method with user: " + this.userId );
      let deadlines = Deadlines.find({tripId: deadline.tripId}).fetch();
      deadlines.push(deadline);
      deadlines = _.sortBy( deadlines, 'due' );
      deadlines.forEach(function ( deadline, index ) {
        if(deadline._id){
          Deadlines.update({_id: deadline._id}, {
            deadlineNumber: index+1,
            tripId:  deadline.tripId,
            amount:  deadline.amount,
            due:    deadline.due,
            name:   deadline.name
          });
        } else {
          Deadlines.insert({
            deadlineNumber: index+1,
            tripId: tripId,
            amount: deadline.amount,
            due:    deadline.due,
            name:   deadline.name
          });
        }
      });
    } else {
      throw new Meteor.Error( 403, 'You need to have the proper permission to do this' );
    }
  },
  /**
   * This method deletes a single deadline
   *
   * @method delete.deadline
   */
  'delete.deadline'(deadlineId){
    check( deadlineId, String);

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      logger.info( "Started deleted.deadline method with deadlineId: " + deadlineId );
      return Deadlines.remove({_id: deadlineId});
    } else {
      throw new Meteor.Error( 403, 'You need to have the proper permission to do this' );
    }
  },
  /**
   * This method updates an image that was uploaded by an admin
   * it changes the userId and then adds
   * the admin's ID into the meta so we know that it was uploaded by an admin
   *
   * @method update.imageUserId
   */
  'update.imageUserId'(fileId, changeUserIdToThisId){
    check( fileId, String);
    check( changeUserIdToThisId, String);

    if( Roles.userIsInRole( this.userId, 'admin' ) ) {
      logger.info( "Started update.imageUserId method with fileId: " + fileId + "and changeUserIdToThisId: " + changeUserIdToThisId );
      return Images.update({_id: fileId}, {$set: {userId: changeUserIdToThisId, meta: {"uploadedByAdmin": true, "adminId": this.userId}}});
    } else {
      throw new Meteor.Error( 403, 'You need to have the proper permission to do this' );
    }
  }
});