Template.PrintOne.onRendered(function () {
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
    window.print();
  }, 2000);
});