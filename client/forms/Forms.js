import { updateForm, fillFormData } from '/imports/api/miscFunctions';

Template.Forms.onCreated(function () {
  this.autorun(() => {
    Meteor.subscribe('files.images');
    Meteor.subscribe('forms');
  });
});

Template.Forms.events({
  'click #delete-passport-photo'(){
    console.log("delete");
    Meteor.call("delete.passportPhoto");
    Session.delete("passportPhotoThumbnail");
    Session.delete("passportPhotoOriginal");
  },
  'change #missionaryInformationForm, change #mediaReleaseForm, change #missionTripCodeOfConductForm, change #releaseAndWaiverOfLiabilityForm'(e){
    if(!e.target.value) return;
    $('#' + e.currentTarget.id).valid();
    console.log("e: ", e.currentTarget.id);
    console.log("Target: ", e.target);
    console.log("Name: ", e.target.name);
    console.log("Value: ", e.target.value);
    let formInfo = {
      formName: e.currentTarget.id,
      form: $('#' + [e.currentTarget.id]).serializeArray()
    };

    updateForm(formInfo);
  },
  'click .expand'(e){
    console.log(e.target.id);
    let formName = e.target.id.split("-").pop();
    console.log(formName);
    let thisFormData = Forms.findOne({userId: Meteor.userId(), formName: formName});
    if(thisFormData && thisFormData.form) fillFormData(thisFormData.form);
  },
});

Template.Forms.helpers({
  images(){
    return Images.find().count()
  }
});
