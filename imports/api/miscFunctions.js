import casual from 'casual-browserify';

export const fillForms = ()=>{
  const password = casual.password;
  $("[name='firstname']").val(casual.first_name);
  $("[name='lastname']").val(casual.last_name);
  $("[name='phone']").val(casual.phone);
  $("[name='address']").val(casual._address1());
  $("[name='city']").val(casual.city);
  $("[name='state']").val(casual.state_abbr);
  $("[name='zip']").val(casual.zip);
  $("[name='email']").val(casual.email);
  $("[name='password']").val(password);
  $("[name='rpassword']").val(password);
  $('[name="tnc"]').prop('checked', true);
};

export const statuses = {
  inProgress:             '<span class="text-right" style="color: orange;"><i class="btn-lg btn-icon-only icon-hourglass"></i> In-progress</span>',
  completed:              '<span class="text-right text-success"> <i class="btn-icon-only btn-lg icon-check"></i> Completed</span>',
  notStarted:             '<span class="text-right" style="color: orangered;"><i class="btn-icon-only btn-lg icon-ban"></i> Not Started</span>',
  waitingForRegistration: '<span class="text-right" style="color: orangered;"><i class="btn-icon-only btn-lg icon-ban"></i> Waiting for Trip Registration</span>'
};


export const getRaisedTotal = (userId)=>{
  let total = 0;
  let adminUserId = userId || Session.get('showingUserId');
  if(Roles.userIsInRole(Meteor.userId(), 'admin')){
    let thisUser = Meteor.users.findOne({_id: adminUserId});
    if(thisUser && thisUser.profile && thisUser.profile.firstName) {
      let name = thisUser.profile.firstName + " " + thisUser.profile.lastName;
      DTSplits.find({memo: {$regex: name}}).map( function ( doc ) {
        total += doc.amount_in_cents;
      } );
    }
  } else {
    DTSplits.find().map( function ( doc ) {
      total += doc.amount_in_cents;
    } );
  }
  return (total / 100).toFixed( 2 );
};

export const getRaisedTotalForTrip = (tripId)=>{
  let total = 0;
  DTSplits.find({fund_id: tripId}).map( function ( doc ) {
    total += doc.amount_in_cents;
  } );
  return (total / 100).toFixed( 2 );
};

export const getDeadlineTotal = (userId)=>{
  let total = 0;
  let user;
  if(userId) {
    user = Meteor.users.findOne( { _id: userId } );
  } else {
    user = Meteor.user();
  }
  if(user && user.tripId){
      Deadlines.find({tripId: user.tripId}).map( function ( doc ) {
        total += doc.amount;
      } );
    return (total).toFixed( 2 );
  }
  return;
};

export const getDeadlinesTotalForTrip = (tripId)=>{
  let total = 0;

  if(tripId){
      Deadlines.find({tripId}).map( function ( doc ) {
        total += doc.amount;
      } );
    return (total).toFixed( 2 );
  }
  return;
};

export const getDeadlineAdjustmentsForTrip = (tripId)=>{
  let total = 0;
  if(tripId){
    DeadlineAdjustments.find({tripId}).map( function ( doc ) {
      total += doc.adjustmentAmount;
    } );
  }
  return (total).toFixed( 2 );
};

export const getDeadlineAdjustments = (userId)=>{
  let total = 0;
  if(userId){
    let user = Meteor.users.findOne({_id: userId});
    if(user && user.tripId){
      DeadlineAdjustments.find({tripId: user.tripId, userId: user._id}).map( function ( doc ) {
        total += doc.adjustmentAmount;
      } );
    }
  } else {
    if(Meteor.user() && Meteor.user.tripId){
      DeadlineAdjustments.find({tripId: Meteor.user().tripId, userId: user._id}).map( function ( doc ) {
        total += doc.adjustmentAmount;
      } );
    }
  }
  return (total).toFixed( 2 );
};

export const repeaterSetup = () =>{
  $('.mt-repeater').each(function(){
    $(this).repeater({
      show: function () {
        $(this).slideDown(1000);
        $('.date-picker').datepicker({
          orientation: "left",
          autoclose: true
        });
        $("[name='trip-id']").val(Session.get("tripId"));
      },

      hide: function (deleteElement) {
        if(confirm('Are you sure you want to delete this element?')) {
          $(this).slideUp(deleteElement);
        }
      }
    });
  });
};

export const getSignedURLs = (client, type, file_id) =>{
  let image = Images.findOne({_id: file_id});
  if(image && image._id) {
    if(type === 'thumbnail') {
      let signedThumbnailURL = client.signedUrl(image.versions.thumbnail.meta.pipePath,
        new Date((new Date().getTime() + 600000)));
      Images.update({_id: image._id}, {
        $set: {
          'versions.thumbnail.meta.signedURL':  signedThumbnailURL,
          'versions.thumbnail.meta.expires':    (new Date().getTime() + 600000)
        }});
    } else {
      let signedOriginalURL = client.signedUrl(image.versions.original.meta.pipePath,
        new Date((new Date().getTime() + 600000)));

      Images.update({_id: image._id}, {
        $set: {
          'versions.original.meta.signedURL':  signedOriginalURL,
          'versions.original.meta.expires':    (new Date().getTime() + 600000)
        }});
    }
    return 'completed';
  } else {
    logger.error("No image found");
    return;
  }
};
