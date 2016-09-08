//TODO: 1. CRUD for trips
// 2. CRUD for Fundraisers
// 3. CRUD for Forms
// 4. CRUD for

// TODO:  Consider using Apollo here instead of HTTP calls to DonorTools, we wouldn't
// even need to store that trip data if we could use apollo
// rp can do async request promise calls to get REST data


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
    console.log("Got to update.form");
    console.dir(formInfo);
    Forms.upsert({userId: this.userId, formName: formInfo.formName}, {
      userId: this.userId,
      formName: formInfo.formName,
      form: formInfo.form
    });
  }
});