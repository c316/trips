import { FilesCollection } from 'meteor/ostrio:files';
import { Random } from 'meteor/random'
import gm from 'gm';

var knox, bound, client, Request, cfdomain, Collections = {};


if (Meteor.isServer) {
  // Fix CloudFront certificate issue
  // Read: https://github.com/chilts/awssum/issues/164
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

  knox    = Npm.require('knox');
  Request = Npm.require('request');
  bound = Meteor.bindEnvironment(function(callback) {
    return callback();
  });
  cfdomain = Meteor.settings.AWS.cfdomain; // <-- Change to your Cloud Front Domain
  client = knox.createClient({
    key: Meteor.settings.AWS.key,
    secret: Meteor.settings.AWS.secret,
    bucket: Meteor.settings.AWS.bucket,
    region: Meteor.settings.AWS.region
  });

  // Meteor method for getting a signed URL (which expires in 10 minutes),
  // files can't be viewed from this bucket without the signed URL
  Meteor.methods({
    'getSignedURLs'(){
      if (!this.userId) return;
      let image = Images.findOne({userId: this.userId});
      if(image && image._id) {

        let signedThumbnailURL = client.signedUrl(image.versions.thumbnail.meta.pipePath,
          new Date((new Date().getTime() + 600000)));
        let signedOriginalURL = client.signedUrl(image.versions.original.meta.pipePath,
          new Date((new Date().getTime() + 600000)));
        console.log(signedThumbnailURL);
        return {
          original: signedOriginalURL,
          thumbnail: signedThumbnailURL
        };
      } else {
        console.error("No image found");
        return;
      }
    }
  });


  createThumbnails = function(collection, fileRef) {
    const cropName = fileRef.path + "__thumbnail__." + fileRef.extension;
    var image = gm(fileRef.path);

    var Future = Npm.require('fibers/future');
    var fut = new Future();
    var updateAndSave = function(error){
      return bound(function(){
        if (error)
          console.error( error);
        const upd = {
          $set: {
            "versions.thumbnail" : {
              path: cropName,
              type: fileRef.type,
              extension: fileRef.extension
            }
          }
        };
        console.log("thumb generated");
        fut.return(collection.update( fileRef._id, upd ));
      });
    };
    image.resize(250, 250).write(cropName, updateAndSave);

    return fut.wait();
  };
}

Images = new FilesCollection({
  debug: true, // Change to `true` for debugging
  throttle: false,
  storagePath: 'assets/app/uploads/Images',
  collectionName: 'Images',
  allowClientCode: false,
  onAfterUpload: function(fileRef) {

  let createdThumbnail = createThumbnails(this.collection, fileRef);
    // In onAfterUpload callback we will move file to AWS:S3
    var self = this;
    let updatedFileVersions = Images.findOne({_id: fileRef._id});
    _.each(updatedFileVersions.versions, function(vRef, version) {
      console.log(vRef, version);
      // We use Random.id() instead of real file's _id
      // to secure files from reverse engineering
      // As after viewing this code it will be easy
      // to get access to unlisted and protected files
      var filePath = "files/" + (Random.id()) + "-" + version + "." + fileRef.extension;
      client.putFile(vRef.path, filePath, function(error, res) {
        bound(function() {
          var upd;
          if (error) {
            console.error(error);
          } else {
            upd = {
              $set: {}
            };
            upd['$set']["versions." + version + ".meta.pipeFrom"] = cfdomain + '/' + filePath;
            upd['$set']["versions." + version + ".meta.pipePath"] = filePath;
            self.collection.update({
              _id: fileRef._id
            }, upd, function(error) {
              if (error) {
                console.error(error);
              } else {
                // Unlink original files from FS
                // after successful upload to AWS:S3
                self.unlink(self.collection.findOne(fileRef._id), version);
              }
            });
          }
        });
      });
    });
  },
  interceptDownload: function(http, fileRef, version) {
    var path, ref, ref1, ref2;
    path = (ref = fileRef.versions) != null ? (ref1 = ref[version]) != null ? (ref2 = ref1.meta) != null ? ref2.pipeFrom : void 0 : void 0 : void 0;
    if (path) {
      // If file is moved to S3
      // We will pipe request to S3
      // So, original link will stay always secure
      Request({
        url: path,
        headers: _.pick(http.request.headers, 'range', 'accept-language', 'accept', 'cache-control', 'pragma', 'connection', 'upgrade-insecure-requests', 'user-agent')
      }).pipe(http.response);
      return true;
    } else {
      // While file is not yet uploaded to S3
      // We will serve file from FS
      return false;
    }
  }
});

if (Meteor.isServer) {
  // Intercept File's collection remove method
  // to remove file from S3
  var _origRemove = Images.remove;

  Images.remove = function(search) {
    var cursor = this.collection.find(search);
    cursor.forEach(function(fileRef) {
      _.each(fileRef.versions, function(vRef) {
        var ref;
        if (vRef != null ? (ref = vRef.meta) != null ? ref.pipePath : void 0 : void 0) {
          client.deleteFile(vRef.meta.pipePath, function(error) {
            bound(function() {
              if (error) {
                console.error(error);
              }
            });
          });
        }
      });
    });
    // Call original method
    _origRemove.call(this, search);
  };
}
