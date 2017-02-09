Template.uploadForm.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
});

Template.uploadForm.helpers({
  currentUpload: function () {
    return Template.instance().currentUpload.get();
  }
});

Template.uploadForm.events({
  'change #fileInput': function (e, template) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // multiple files were selected
      var upload = Images.insert({
        file: e.currentTarget.files[0],
        meta: {otherUserId: Session.get("showingUserId")},
        streams: 'dynamic',
        chunkSize: 'dynamic'
      }, false);

      upload.on('start', function () {
        template.currentUpload.set(this);
      });

      upload.on('end', function (error, fileObj) {
        if (error) {
          alert('Error during upload: ' + error);
        } else {
          alert('File "' + fileObj.name + '" successfully uploaded');
          if (Session.get("showingOtherUser")) {
            // todo: call the update method to change the user ID
            Meteor.call("update.imageUserId", fileObj._id, Session.get("showingUserId"), function (err, res) {
              if(err) {
                console.error("There was a problem with this method call:", err);
              } else {
                console.log(res);
              }
            })
          }
        }
        template.currentUpload.set(false);
      });

      upload.start();
    }
  }
});