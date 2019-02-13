import { bertSuccess, bertError } from '../../imports/api/utils';

Template.EditTrip.onCreated(function() {
  this.autorun(() => {
    Session.set('tripId', Number(FlowRouter.getParam('tripId')));
    Meteor.subscribe('Trips', Session.get('tripId'), true);
    Meteor.subscribe('TripDeadlines', Session.get('tripId'));
  });
});

Template.EditTrip.onRendered(function() {
  setTimeout(function() {
    $('.date-picker').datepicker({
      orientation: 'bottom',
      autoclose: true,
    });

    $('.date-picker')
      .datepicker()
      .on('change', function(e) {
        // `e` here contains the extra attributes
        $(e.currentTarget).addClass('edited');
      });
  }, 1000);
});

Template.EditTrip.events({
  'click .delete-me'(event) {
    event.preventDefault();
    const deleteThis = event.target.getAttribute('data-deadline-id');
    const btn = $(`[data-deadline-id='${deleteThis}']`);
    btn.button('loading');
    Meteor.call('delete.deadline', deleteThis, function(err) {
      if (err) {
        console.error(err);
        bertError('', err.reason);
        btn.button('error');
      } else {
        bertSuccess('', 'Successfully deleted a deadline.');
      }
    });
  },
  'submit form'(event) {
    event.preventDefault();
    const formId = event.target.id;
    const tripId = Session.get('tripId');
    const name = event.target.deadlineName.value;
    const amount = parseInt(event.target.amount.value, 10);
    const due = new Date(event.target.due.value);
    const deadline = { name, amount, due };
    const btn = $('button[type=submit]', `#${formId}`);
    btn.button('loading');
    if (formId === 'insert-new-deadline') {
      Meteor.call('insert.deadline', deadline, tripId, function(err) {
        if (err) {
          console.error(err);
          bertError('', err.reason);
          btn.button('error');
        } else {
          bertSuccess('', 'Successfully inserted a new deadline.');
          btn.button('success');
          event.target.reset();
          $('#new-deadline').slideUp();
        }
      });
    } else {
      deadline._id = formId;
      deadline.tripId = tripId;
      Meteor.call('update.deadline', deadline, function(err) {
        if (err) {
          console.error(err);
          bertError('', err.reason);

          btn.button('error');
        } else {
          bertSuccess('', 'Successfully updated a deadline.');
          btn.button('success');
        }
      });
    }
  },
  'click .add-deadline'() {
    $('#new-deadline').slideDown(1000);
  },
  'change [name="showFundraisingModule"]'(event) {
    const show = event.target.value === 'yes';
    Meteor.call(
      'edit.trip.fundraising',
      Number(Session.get('tripId')),
      show,
      function(err, res) {
        if (err) {
          console.error(err);
        } else {
          console.log(res);
        }
      },
    );
  },
});

Template.EditTrip.helpers({
  trip() {
    return Trips.findOne();
  },
  Deadlines() {
    return Deadlines.find({}, { sort: { due: 1 } });
  },
  tripId() {
    return Trips.findOne() && Trips.findOne().tripId;
  },
  NoDeadlines() {
    return Deadlines.find() && Deadlines.find().count() === 0;
  },
});
