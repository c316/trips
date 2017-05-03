Template.MissionaryInfoForm.onRendered(function(){

});

Template.MissionaryInfoForm.helpers({
  missionaryInformation(){
    let thisForm = Forms.findOne({name: 'missionaryInformationForm', userId: this._id});
    return thisForm || {};
  }
});

Template.MissionaryInfoForm.events({
  'submit form'(e, tmpl){
    //e.preventDefault();
    console.log(e.target);

    console.log("input received");
    // check to see if the trip leader is looking at the form to verify it, if so, then
    // exit this change function
    if(Session.get("verifying")){
      return;
    }
    // This will be called several times when the form renders, make sure
    // you check to see if the value being passed is empty
    // Then check that if is is empty that is was empty in the document
    // if it wasn't empty in the document then that means the user
    // deleted the value here and we should then update to the new blank value
    /*if(!e.target.value){
      let thisForm = Forms.findOne({_id: this._id});
      if(!thisForm) return;
      let oldValue = thisForm[e.target.name];
      if(!oldValue) {
        return;
      }
    }*/

    console.log("Got past valid");

    // Get all the form data, convert it to an object and for the array of
    // checkboxes called, 'iWouldLikeToParticipateIn' push them into one key,
    // otherwise this value will be overwritten and you'll only get the last value
    // inserted into the document
    let form = {};
    let iWouldLikeToParticipateIn = [];
    $("#missionaryInfoForm").serializeArray().map(function(x){
      if(x.value) {
        if(x.name === 'iWouldLikeToParticipateIn'){
          iWouldLikeToParticipateIn.push(x.value);
        } else {
          form[x.name] = x.value;
        }
      }
    });
    form.iWouldLikeToParticipateIn = iWouldLikeToParticipateIn;
    form.name = 'missionaryInformationForm';
    form.verified = form.verified ? true : false;
    if(form.verified){
      form.verifiedDate = new Date(form.verifiedDate);
    }

    let updateThisId = tmpl && tmpl.data._id;
    /*Meteor.call("update.form", form, updateThisId, function(err, res){
      if(err) console.error(err);
      else console.log(res);
    });*/
  },
});
