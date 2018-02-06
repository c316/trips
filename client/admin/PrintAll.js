Template.PrintAll.onCreated(function () {
  this.autorun(()=> {
    tripId = new ReactiveVar(Number(FlowRouter.getParam("tripId")));
    Meteor.subscribe('users', "", 100, tripId.get(), false);
  });
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
    if(tripId.get() && Meteor.users.findOne( { tripId: tripId.get() } ) ) {
      window.print();
    }
  }, 2000);
});
