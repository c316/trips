import { statuses } from '/imports/api/miscFunctions';

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
    Meteor.subscribe('Trips');
    if(this.data && this.data._id){
      Meteor.subscribe('Forms', this.data._id);
    } else {
      Meteor.subscribe('Forms');
    }
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
    let tripForm = Forms.findOne( { formName:  'tripRegistration' } );
    if(tripForm && tripForm._id){
      let forms = Forms.find({
        formName:  {
          $ne: 'tripRegistration'
        },
        $or: [{completed: true}, {agreed: true}]
      } );
      let totalNumberOfForms = forms && forms.count();
      if (totalNumberOfForms === 4){
        return statuses.completed;
      } else {
        return statuses.inProgress;
      }
    } else {
      return statuses.notStarted;
    }
  },
  unfinishedForms(){
    // todo: find how many forms there are (don't include the trip id form) and return the number left to complete
    let forms = Forms.find({
      formName:  {
        $ne: 'tripRegistration'
      },
      $or: [{completed: true}, {agreed: true}]
    } );
    let totalNumberOfForms = forms && forms.count();
    return 4 - (totalNumberOfForms || 0);
  },
  unfinishedFormsPercent(){
    let forms = Forms.find({
      formName:  {
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
