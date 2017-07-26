Template.EditTrip.onCreated(function () {
  Session.set("tripId", Number(FlowRouter.getParam("tripId")));
  this.autorun(()=>{
    Meteor.subscribe('Trips', Session.get("tripId"));
    Meteor.subscribe('TripDeadlines', Session.get("tripId"));
  });
});

Template.EditTrip.onRendered(function () {
  setTimeout(function () {
    $( '.date-picker' ).datepicker( {
      orientation: "bottom",
      autoclose:   true
    } );

    $( '.date-picker' ).datepicker()
      .on( 'change', function ( e ) {
        // `e` here contains the extra attributes
        $( e.currentTarget ).addClass( 'edited' );
      } );
  }, 1000);
});

Template.EditTrip.events({
  'click .delete-me'(e){
    e.preventDefault();
    let deleteThis = e.target.getAttribute('data-deadline-id');
    console.log(deleteThis);
    console.log("Clicked '.delete'");

    let btn = $("[data-deadline-id='" + deleteThis + "']");
    btn.button("loading");
    Meteor.call( "delete.deadline", deleteThis, function ( err, res ) {
      if( err ) {
        console.error( err );
        Bert.alert( err.reason, 'danger' );
        btn.button( 'error' );
      } else {
        console.log( res );
        Bert.alert( 'Thanks for adding the deadlines, users can now join this trip.', 'success' );
      }
    });
  },
  'submit form'(e){
    e.preventDefault();
    let formId = e.target.id;
    let tripId = Session.get( "tripId" );
    let name = e.target.deadlineName.value;
    let amount = parseInt(e.target.amount.value);
    let due = new Date(e.target.due.value);
    let deadline = {name, amount, due};
    let btn = $("button[type=submit]", "#" + formId);
    btn.button("loading");
    if(formId === "insert-new-deadline") {
     Meteor.call( "insert.deadline", deadline, tripId, function ( err, res ) {
       if( err ) {
         console.error( err );
         Bert.alert( err.reason, 'danger' );
         btn.button( 'error' );
       } else {
         console.log( res );
         Bert.alert( 'Successfully inserted a new deadline.', 'success' );
         btn.button( 'success' );
         e.target.reset();
         $( "#new-deadline" ).slideUp();
       }
     });
    } else {
      console.log("Got to update-deadline");
      deadline._id = formId;
      deadline.tripId = tripId;
      console.log(deadline);
      Meteor.call( "update.deadline", deadline, function ( err, res ) {
        if( err ) {
          console.error( err );
          Bert.alert( err.reason, 'danger' );
          btn.button( 'error' );
        } else {
          console.log( res );
          Bert.alert( 'Successfully updated a deadline.', 'success' );
          btn.button( 'success' );
        }
      });
    }
  },
  'click .add-deadline'(){
    $( "#new-deadline" ).slideDown(1000);
  },
  'change [name="showFundraisingModule"]'(e){
    console.log("Changed");
    const show = e.target.value === 'yes';
    Meteor.call("edit.trip.fundraising", Number(Session.get("tripId")), show, function (err, res) {
      if(err) {
        console.error(err);
      } else {
        console.log(res);
      }
    });
  }
});

Template.EditTrip.helpers({
  trip(){
    return Trips.findOne();
  },
  Deadlines(){
    return Deadlines.find({}, {sort: {due: 1}});
  },
  tripId(){
    return Trips.findOne() && Trips.findOne().tripId;
  },
  NoDeadlines(){
    return Deadlines.find() && Deadlines.find().count() === 0;
  }
});