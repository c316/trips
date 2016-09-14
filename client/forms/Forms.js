import { updateForm, fillFormData, statuses } from '/imports/api/miscFunctions';

const agreeToForm = (name, data) =>{
  Meteor.call("form.agree", name, function ( err, res ) {
    if(err) console.error(err);
    else {
      console.log(res);
      // TODO: update the button
      return res;
    }
  });
};

Template.Forms.onCreated(function () {
  this.autorun(() => {
    Meteor.subscribe('files.images');
    Meteor.subscribe('Forms');
    Meteor.subscribe('Trips');
  });
});

Template.Forms.onRendered(function () {
  if(Session.equals("showForms", true)){
    $("#expand-forms-button").click();
  }
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
    let formName = e.target.id.split("-").pop();
    let thisFormData = Forms.findOne({userId: Meteor.userId(), formName: formName});
    if(thisFormData && thisFormData.form) fillFormData(thisFormData.form);
  },
  'click #code-of-conduct'(e){
    e.preventDefault();
    let btn = $('#code-of-conduct');
    btn.button("loading");
    agreeToForm("code-of-conduct");
    btn.button("success");
  },
  'click #media-release'(e){
    e.preventDefault();
    let btn = $('#media-release');
    btn.button("loading");
    agreeToForm("media-release");
    btn.button("success");
  },
  'click #waiver-of-liability'(e){
    e.preventDefault();
    let btn = $('#waiver-of-liability');
    btn.button("loading");
    agreeToForm("waiver-of-liability");
    btn.button("success");
  }
});

Template.Forms.helpers({
  imageExists(){
    return Images.find().count();
  },
  images(){
    return Images.find().fetch()[0];
  },
  status(){
    let tripForm = Forms.findOne({
      formName:  {
        $in: ['waiver-of-liability',
              'code-of-conduct',
              'media-release',
              'missionaryInformationForm'
        ]
      }
    } );
    if(tripForm && tripForm._id){
      // TODO: check if all the forms are complete and return completed if they are

      return statuses.inProgress;
    } else {
      return statuses.notStarted;
    }
  }
});
