Template.PrintAll.onCreated(function () {
  Meteor.subscribe('users');
});

Template.PrintAll.onRendered(function () {
  Meteor.setTimeout( ()=> {
    $(".expand").click();
  },2000);

  Meteor.setTimeout(()=>{
    //window.print();
  }, 3000);
});

Template.PrintAll.helpers({
  users(){
    return Meteor.users.find();
  }
});