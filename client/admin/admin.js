import moment from 'moment';

Template.Admin.onRendered(function () {

});

Template.Admin.events({
  'submit #verseForm'(e){
    e.preventDefault();
    Meteor.call('forms.insertVerse', {
      book:       $("#book").val(),
      chapter:    $("#chapter").val(),
      verse:      $("#verse").val(),
      week:       $("#week").val(),
    }, (err, res) => {
      if (err) {
        Bert.alert(err,'danger');
      } else {
        Bert.alert('Added','success');
      }
    });
  }
});

Template.Admin.helpers({
  weeks(){
    let weeks = [];
    for(i=1; i<=52; i++){
      let thisWeek = {
        number: i,
        range:  moment().week(i).isoWeekday('Monday').format('MMM. DD') + " - " +
                moment().week(i).isoWeekday('Friday').format('MMM. DD')
      };
      weeks.push(thisWeek);
    }
    return weeks;
  },
});