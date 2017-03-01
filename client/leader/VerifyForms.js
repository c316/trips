import { App } from '/imports/ui/js/app';

Template.VerifyForms.onCreated(function () {
  this.autorun(()=>{
    Meteor.subscribe('files.images', Session.get("userId"));
    this.subscribe('Forms', Session.get("userId"));
    this.subscribe('user', Session.get("userId"));
  })
});

Template.VerifyForms.helpers({
  user(){
    return Meteor.users.findOne({_id: Session.get( 'userId')})
  },
  imageExists(){
    return Images.find().count();
  },
  thisUserImageExists(){
    return Images.find({userId: this._id}).count();
  },
  images(){
    return Images.find().fetch()[0];
  },
  thisUserImages(){
    return Images.find({userId: this._id}).fetch()[0];
  },
  formStarted(name){
    const form = Forms.findOne( { name: name, userId: this._id });
    return form;
  },
  formCompleted(name){
    const form = Forms.findOne( { name: name, userId: this._id,
      $or: [{completed: true}, {agreed: true}]
    } );
    return form;
  },
  formVerified(name){
    return Forms.findOne( { name: name, userId: this._id, verified: true} );
  },
});

Template.VerifyForms.events({
  'click .verified'(e){
    var nextId = $(".tab-pane.active").next().attr("id");
    console.log(nextId);
    const formName = e.target.getAttribute('data-form-name');

    Meteor.call("form.verify", formName, this._id, function(err, res){
      if(err) {
        console.error(err);
        Bert.alert({
          title: 'Error',
          message: err.reason,
          type: 'danger',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-down'
        });
      } else {
        console.log(res);
        if(formName === "passportImage" ){
          FlowRouter.go("/leader");
        } else {
          $('a[href="#'+nextId+'"]').click();
        }
        Bert.alert({
          title: 'Verified',
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-up'
        });
        App.scrollTo($('.steps'));
      }
    });

  },'click .next'(){
    console.log("clicked verified");
    var nextId = $(".tab-pane.active").next().attr("id");
    console.log(nextId);
    $('a[href="#'+nextId+'"]').click();
    App.scrollTo($('.steps'));
  },
  'click #skip-photo'(){
    console.log("clicked skip-photo");
    App.scrollTo($('.portlet-title'));
    FlowRouter.go("/leader");
  }
});

Template.VerifyForms.onDestroyed(function () {
  Session.delete("userId");
  Session.delete("tripId");
});