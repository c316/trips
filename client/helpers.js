import moment from 'moment';

Template.registerHelper('formatTime', function(context) {
  if (context) {
    return moment( context ).format( 'MM/DD/YYYY, hh:mma' );
  }
});
Template.registerHelper('showTools', function() {
  const routeName = FlowRouter.current().route.path;
  return routeName.includes("admin");
});

Template.registerHelper('passportPhotos', function() {
  Meteor.setTimeout(()=>{
    Meteor.call( "getSignedURLs", function ( err, res ) {
      if( err ) {
        console.error( err );
        return;
      } else {
        console.log( res );
        if(res && res.thumbnail) {
          Session.set("passportPhotoThumbnail", res.thumbnail);
          Session.set("passportPhotoOriginal", res.original);
        }
        return;
      }
    } );
  },3000);
});



Template.registerHelper('passportPhotoThumbnail', function() {
  return Session.get("passportPhotoThumbnail");
});
Template.registerHelper('passportPhotoOriginal', function() {
  return Session.get("passportPhotoOriginal");
});
