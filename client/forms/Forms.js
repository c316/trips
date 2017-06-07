const agreeToForm = (name, data) =>{
  Meteor.call("form.agree", name, function ( err, res ) {
    if(err) console.error(err);
    else {
      return res;
    }
  });
};

Template.Forms.onCreated(function () {
  Meteor.call("updateExpiredSignedURLS");
  this.autorun(() => {
    Meteor.subscribe('files.images', Session.get("showingUserId"));
    Meteor.subscribe('Trips');
    if(this.data && this.data._id){
      Meteor.subscribe('Forms', this.data._id);
    } else {
      if(Roles.userIsInRole(Meteor.userId(), 'admin')){
        Meteor.subscribe('Forms');
      }
    }
  });
});

Template.Forms.onRendered(function () {
  if(Session.equals("showForms", true)){
    $("#expand-forms-button").click();
    $('html, body').animate({
      scrollTop: ($('#forms-portlet').offset().top - 170)
    },500);
  }
});

Template.Forms.events({
  'click #delete-passport-photo'(){
    Meteor.call("delete.passportPhoto", Session.get("showingUserId"));
    Session.delete("passportPhotoThumbnail");
    Session.delete("passportPhotoOriginal");
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
  }/*,
  'click #expand-missionaryInformationForm'(){
    console.log("clicked expand")
    $("#missionaryInfoForm").conversationalForm({
      context: document.getElementById("cf-context-form"),
      submitCallback: (e) => {
        console.log(e);
      }
    });
  }*/
});

Template.Forms.helpers({
  unfinishedForms(){
    let forms = Forms.find({
      name:  {
        $ne: 'tripRegistration'
      },
      $or: [{completed: true}, {agreed: true}]
    } );
    let totalNumberOfForms = forms && forms.count();
    return 4 - (totalNumberOfForms || 0);
  },
  unfinishedFormsPercent(){
    let forms = Forms.find({
      name:  {
        $ne: 'tripRegistration'
      },
      $or: [{completed: true}, {agreed: true}]
    } );
    let totalNumberOfForms = forms && forms.count();
    return {
      'completed': ( ( ( totalNumberOfForms ? totalNumberOfForms : 0 ) / 4 ) * 100 ),
      'remaining': Math.abs( ( ( ( totalNumberOfForms ? totalNumberOfForms : 0 ) / 4 ) * 100 ) - 100)
    };
  }
});

Template.Forms.onDestroyed(function () {
  Session.delete("showForms");
  Session.delete("showUserRegistration");
});