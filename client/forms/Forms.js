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
    Meteor.call("delete.passportPhoto", Session.get("showingUserId") || Meteor.userId());
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
  }
});

Template.Forms.helpers({
  MIFCompleteOrNot(){
    const MIF = Forms.findOne({
      name: 'missionaryInformationForm',
      userId: this._id,
      completed: true
    });
    if(MIF){
      return 'font-dark';
    } else {
      return 'font-red';
    }
  },
  MRFCompleteOrNot(){
    const form = Forms.findOne({
      name: 'media-release',
      userId: this._id,
      agreed: true
    });
    if(form){
      return 'font-dark';
    } else {
      return 'font-red';
    }
  },
  CoCCompleteOrNot(){
    const form = Forms.findOne({
      name: 'code-of-conduct',
      userId: this._id,
      agreed: true
    });
    if(form){
      return 'font-dark';
    } else {
      return 'font-red';
    }
  },
  WoLCompleteOrNot(){
    const form = Forms.findOne({
      name: 'waiver-of-liability',
      userId: this._id,
      agreed: true
    });
    if(form){
      return 'font-dark';
    } else {
      return 'font-red';
    }
  }
});

Template.Forms.onDestroyed(function () {
  Session.delete("showForms");
  Session.delete("showUserRegistration");
});