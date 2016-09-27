Template.PrintAll.onCreated(function () {
  Meteor.subscribe('users');
});

Template.PrintAll.onRendered(function () {
  Meteor.setTimeout( ()=> {
    $(".expand").click();
  },1500);

  Meteor.setTimeout(()=>{
    //window.print();
    $.each($('form').serializeArray(), function(index, value){
      $('[name="' + value.name + '"]').attr('readonly', 'readonly');
      $('[name="' + value.name + '"]').attr('disabled', 'disabled');
    });
    $('form :input').attr("disabled", true);
  }, 2100);

  Meteor.setTimeout(()=>{
    if(Session.get("tripId") && Meteor.users.findOne( { tripId: Session.get("tripId") } ) ) {
      window.print();
    }
  }, 2000);
});

Template.PrintAll.helpers({
  users(){
    if(Session.get("tripId")){
      return Meteor.users.find({tripId: Session.get("tripId")});
    }
  }
});

Template.PrintAll.onDestroyed(function () {
  Session.delete("showingOtherUser");
  Session.delete("tripId");
});