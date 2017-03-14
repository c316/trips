Template.AddTripIdToUserModal.onCreated(function () {
  this.autorun(()=>{
    if(Session.get("tripId")){
      Meteor.subscribe('Trips');
    }
  });
});

Template.AddTripIdToUserModal.helpers({
  trip(){
    return Trips.find();
  }
});

Template.AddTripIdToUserModal.events({
  'click #save-change'(e){
    console.log('you clicked', $("#trips").val(), Session.get("showingUserId"));
    $('#trips-modal').modal('hide');
    Meteor.call("form.tripRegistration", $("#trips").val().trim(), Session.get("showingUserId"), function (err, res) {
      if(err){
        console.error(err);
        Bert.alert({
          title: "Sorry",
          message: 'Hmm...there was a problem adding that user to a trip. Try refreshing this page, then try again. If you still have problems, contact the admin.',
          type: 'danger',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-down'
        });
      } else {
        console.log(res);
        Bert.alert({
          title: 'Leader',
          message: 'This user is now a member of that trip.',
          type: 'success',
          style: 'growl-bottom-right',
          icon: 'fa-thumbs-up'
        });
        Meteor.call("add.roleToUser", Session.get("showingUserId"), 'leader', function (err, res) {
          if (err) console.error(err);
          else {
            console.log(res);
            Bert.alert({
              title: 'Leader',
              message: 'This user is now a trip leader.',
              type: 'success',
              style: 'growl-bottom-right',
              icon: 'fa-thumbs-up'
            });
          }
        });
      }
    })
  }
});

Template.AddTripIdToUserModal.onDestroyed(function () {
  Session.delete("showingUserId", this._id);
});