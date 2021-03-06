import { ReactiveVar } from 'meteor/reactive-var';

import { repeater } from '/imports/ui/js/jquery.repeater';
import {
  repeaterSetup,
  setDocHeight,
  updateSearchVal,
} from '/imports/api/miscFunctions';
import '/imports/ui/stylesheets/admin-print.css';
import { bertSuccess, bertError } from '../../imports/api/utils';

Template.Admin.onCreated(function() {
  Session.delete('showingUserId');
  Session.set('documentLimit', 30);
  Session.set('showExpired', false);

  this.autorun(() => {
    Meteor.subscribe(
      'users',
      Session.get('searchValue'),
      Session.get('documentLimit'),
      Session.get('tripId') ? Number(Session.get('tripId')) : null,
      Session.get('showAllTrips') ? Session.get('showAllTrips') : false,
    );
    Meteor.subscribe(
      'Trips',
      Session.get('tripId') ? Number(Session.get('tripId')) : null,
      Session.get('showExpired'),
    );
    Meteor.subscribe('Forms');
    Meteor.subscribe('Deadlines');
    Meteor.subscribe('DeadlineAdjustments');
    Meteor.subscribe('DTSplits');
    Meteor.subscribe('Images');
  });
});

Template.Admin.onRendered(() => {
  repeaterSetup();
  setDocHeight();
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
});

Template.Admin.helpers({
  showExpired() {
    return Session.get('showExpired');
  },
  user() {
    if (Session.get('tripId')) {
      return Meteor.users.find(
        { tripId: Session.get('tripId') },
        { sort: { 'profile.lastName': 1, 'profile.firstName': 1 } },
      );
    }
    return Meteor.users.find(
      {},
      { sort: { 'profile.lastName': 1, 'profile.firstName': 1 } },
    );
  },
  trips() {
    return Trips.find({}, { sort: { name: 1 } });
  },
  trip() {
    if (this.tripId) {
      return Trips.findOne({ tripId: this.tripId });
    }
    if (Session.get('tripId')) {
      return Trips.findOne({ tripId: Number(Session.get('tripId')) });
    }
  },
  deadlines() {
    if (this.tripId) {
      return Deadlines.find({ tripId: this.tripId });
    }
  },
  tripId() {
    const trip = this.tripId ? `- Trip ID: ${this.tripId}` : 'No trip';
    return trip;
  },
  thisTripId() {
    return Session.get('tripId');
  },
  newTrip() {
    return Trips.findOne({ tripId: Number(Session.get('tripId')) });
  },
  deadlineAdjustmentValue() {
    const user = Template.parentData(2);
    const deadlineAdjustment = DeadlineAdjustments.findOne({
      tripId: user.tripId,
      userId: user._id,
      deadlineId: this._id,
    });
    return deadlineAdjustment && deadlineAdjustment.adjustmentAmount;
  },
  filteringTrip() {
    return Session.get('tripId');
  },
  numberOfTripParticipants() {
    const tripId = Session.get('tripId');
    const users = Meteor.users.find({ tripId });
    return users.count();
  },
  tripName() {
    const tripId = this.tripId || Session.get('tripId');
    return Trips.findOne({ tripId }) && Trips.findOne({ tripId }).name;
  },
  forms() {
    const tripId =
      Meteor.users.findOne({ _id: this._id }) &&
      Meteor.users.findOne({ _id: this._id }).tripId;
    const passportImage = Images.findOne({ userId: this._id });

    // Past trips, some users might have gone on a trip in the past, and completed forms, but don't have a trip that
    // they are currently registered for
    const otherTrips =
      Meteor.users.findOne({ _id: this._id }) &&
      Meteor.users.findOne({ _id: this._id }).otherTrips;

    if (tripId || otherTrips) {
      const forms = Forms.find({
        name: {
          $ne: 'tripRegistration',
        },
        userId: this._id,
        $or: [{ completed: true }, { agreed: true }],
      });
      const totalNumberOfForms = forms && forms.count();
      if (totalNumberOfForms > 3) {
        if (passportImage) {
          const verifiedForms = Forms.find({
            userId: this._id,
            verified: true,
          });
          const totalNumberOfForms = verifiedForms && verifiedForms.count();
          if (totalNumberOfForms === 4) {
            return [{ name: 'All Verified', complete: true }];
          }
          return [{ name: 'All Completed', complete: true }];
        }
        return [
          {
            name: 'MIF',
            complete: true,
          },
          {
            name: 'MRF',
            complete: true,
          },
          {
            name: 'CoC',
            complete: true,
          },
          {
            name: 'RWL',
            complete: true,
          },
          {
            name: 'Pic',
            complete: false,
          },
        ];
      }
      const formStatus = [];
      const MIF = Forms.findOne({
        name: 'missionaryInformationForm',
        userId: this._id,
        completed: true,
      });
      const MRF = Forms.findOne({
        name: 'media-release',
        userId: this._id,
        agreed: true,
      });
      const CoC = Forms.findOne({
        name: 'code-of-conduct',
        userId: this._id,
        agreed: true,
      });
      const WoL = Forms.findOne({
        name: 'waiver-of-liability',
        userId: this._id,
        agreed: true,
      });
      if (passportImage) {
        formStatus.push({ name: 'Pic', complete: true });
      } else {
        formStatus.push({ name: 'Pic', complete: false });
      }
      if (MIF) {
        formStatus.push({ name: 'MIF', complete: true });
      } else {
        formStatus.push({ name: 'MIF', complete: false });
      }
      if (MRF) {
        formStatus.push({ name: 'MRF', complete: true });
      } else {
        formStatus.push({ name: 'MRF', complete: false });
      }
      if (CoC) {
        formStatus.push({ name: 'CoC', complete: true });
      } else {
        formStatus.push({ name: 'CoC', complete: false });
      }
      if (WoL) {
        formStatus.push({ name: 'WoL', complete: true });
      } else {
        formStatus.push({ name: 'WoL', complete: false });
      }
      return formStatus;
    }
    return [{ name: 'Not Started', complete: false }];
  },
  thisUserIsMe() {
    if (
      !Session.get('tripId') &&
      !Session.get('searchValue') &&
      !Session.get('showAllTrips')
    ) {
      return this._id === Meteor.userId();
    }
    return false;
  },
  searchValue() {
    return Session.get('searchValue');
  },
});

Template.Admin.events({
  'click [name="showExpired"]'(event) {
    event.preventDefault();
    Session.set('showExpired', true);
  },
  'click [name="hideExpired"]'(event) {
    event.preventDefault();
    Session.set('showExpired', false);
  },
  'keyup, change .search': _.debounce(function() {
    updateSearchVal();
  }, 300),
  'click .clear-button'() {
    $('.search')
      .val('')
      .change();
    Session.set('documentLimit', 30);
  },
  'click .user-admin-link'() {
    Session.set('showUserRegistration', true);
    FlowRouter.go('adminShowUserHome', {}, { id: this._id });
  },
  'click .funding-admin-link'() {
    const trip = Trips.findOne({ tripId: this.tripId });
    if (trip && trip.name) {
      Session.set('showTripFunds', true);
    }
    FlowRouter.go('adminShowUserHome', {}, { id: this._id });
  },
  'click .form-admin-link'() {
    const trip = Trips.findOne({ tripId: this.tripId });
    if (trip && trip.name) {
      Session.set('showForms', true);
    }
    FlowRouter.go('adminShowUserHome', {}, { id: this._id });
  },
  'click .deadlines-admin-link'() {
    $(`#collapse-edit-${this._id}`).toggle();
  },
  'click .print-user'() {
    FlowRouter.go('print-one', {}, { id: this._id });
  },
  'click #show-add-trip'(event) {
    event.preventDefault();
    $('#trip-form').slideDown(200);
    $('#show-add-trip').prop('disabled', true);
    $('#show-add-trip').css('cursor', 'not-allowed');
  },
  'click #update-dt-funds'(event) {
    event.preventDefault();
    Trips.find({ expires: { $gte: new Date() } }).map(trip =>
      Meteor.call('update.splits', trip.tripId));
    bertSuccess(
      'Checking',
      'Just asked DonorTools for an update, it might be a minute.',
    );
  },
  'click .filter-trip'() {
    Session.set('tripId', this.tripId);
  },
  'click .export-trip-mif'() {
    Meteor.call('export.formByTrip', this.tripId, function(err, fileContent) {
      if (err) {
        console.error(err);
        bertError('', err.reason);
      } else if (fileContent) {
        const nameFile = `Missionary Information Forms for Trip ${
          this.tripId
        }.csv`;
        const blob = new Blob([fileContent], {
          type: 'text/plain;charset=utf-8',
        });
        import fileSaver from 'file-saver';

        fileSaver.saveAs(blob, nameFile);
      }
    });
  },
  'click #show-all-trips'() {
    Session.delete('tripId');
    Session.set('showAllTrips', true);
  },
  'submit form'(event) {
    event.preventDefault();
    const formId = event.target.id;
    const formName = event.target.name;
    const btn = $(`#${event.target.id}-button`);
    btn.button('loading');
    if (formId === 'trip-form') {
      const tripId = $("[name='trip-id']").val();
      const tripStartDate = new Date($("[name='tripStartDate']").val());
      const tripEndDate = new Date($("[name='tripEndDate']").val());
      const tripExpirationDate = new Date($("[name='tripExpirationDate']").val());
      let showFundraisingModule = $('#financial-module-no').is(':checked')
        ? 'no'
        : $('#financial-module-yes').is(':checked')
          ? 'yes'
          : false;
      if (!showFundraisingModule) {
        bertError(
          '',
          'Please choose one of the options for the fundraising module',
        );
        btn.button('reset');
        return;
      }
      showFundraisingModule === 'yes'
        ? (showFundraisingModule = true)
        : (showFundraisingModule = false);

      if (!tripId || !tripStartDate || !tripEndDate || !tripExpirationDate) {
        bertError(
          '',
          'Please make sure you have a trip start date, end date, expiration date and a trip id',
        );
        btn.button('reset');
        return;
      }
      Meteor.call(
        'add.trip',
        tripId,
        {
          tripStartDate,
          tripEndDate,
          tripExpirationDate,
          showFundraisingModule,
        },
        function(err, res) {
          if (err) {
            console.error(err);
            bertError('', err.reason);
            btn.button('error');

            $('#show-add-trip').prop('disabled', false);
            $('#show-add-trip').css('cursor', 'pointer');
          } else {
            console.log(res);
            Session.set('tripId', tripId);

            bertSuccess('', 'Ok, we have a trip now add the details, please.');
            btn.button('success');
            // reset the add-trip form
            event.target.reset();
            $('#trip-form').slideUp();
            // Show the full-trip-form
            $('#full-trip-form-div').slideDown(2000);

            $('#show-add-trip').prop('disabled', false);
            $('#show-add-trip').css('cursor', 'pointer');
            Meteor.call('update.splits', Number(tripId), function(
              error,
              result,
            ) {
              if (error) console.error(error);
              else console.log(result);
            });
          }
        },
      );
    } else if (formId === 'full-trip-form') {
      const formatedRepeaterForm = $('.mt-repeater').repeaterVal();
      const tripId = Session.get('tripId');
      Meteor.call(
        'add.deadline',
        formatedRepeaterForm.deadlines,
        tripId,
        function(err, res) {
          if (err) {
            console.error(err);
            bertError('', err.reason);
            btn.button('error');
          } else {
            console.log(res);
            bertSuccess(
              '',
              'Thanks for adding the deadlines, users can now join this trip.',
            );
            $('#full-trip-form-div').slideUp();
            btn.button('success');
            event.target.reset();
          }
        },
      );
    } else if (formName === 'update-deadline') {
      console.log(event.target.getAttribute('data-userid'));
      const user = Meteor.users.findOne({
        _id: event.target.getAttribute('data-userid'),
      });

      const deadlines = [];
      const deadlineAdjustments = Deadlines.find({ tripId: user.tripId }).map(function(deadline) {
        deadlines.push({
          deadlineId: deadline._id,
          adjustmentAmount: event.target[deadline._id].value,
        });
      });
      Meteor.call(
        'update.user.deadline',
        deadlines,
        user._id,
        user.tripId,
        function(err, res) {
          if (err) {
            console.error(err);
            bertError('', err.reason);
            btn.button('error');
          } else {
            console.log(res);
            bertSuccess('', 'Ok, you should now see the deadline adjustment.');
            $('#full-trip-form-div').slideUp();
            btn.button('success');
          }
        },
      );
    }
  },
  'click #trip-form-cancel-button'() {
    $('#show-add-trip').prop('disabled', false);
    $('#show-add-trip').css('cursor', 'pointer');
    $('#financial-module-no').prop('checked', false);
    $('#financial-module-yes').prop('checked', false);
    $('#trip-form').slideUp();
  },
  'click .make-admin-link'() {
    Meteor.call('add.roleToUser', this._id, 'admin', function(err, res) {
      if (err) console.error(err);
      else {
        console.log(res);
        bertSuccess('Admin', 'This user has been updated.');
      }
    });
  },
  'click .make-trip-leader'() {
    const updateThisUser = Meteor.users.findOne({ _id: this._id });
    Session.set('showingUserId', this._id);
    if (updateThisUser && updateThisUser.tripId) {
      Meteor.call('add.roleToUser', this._id, 'leader', function(err, res) {
        if (err) console.error(err);
        else {
          console.log(res);
          bertSuccess('Leader', 'This user is now a trip leader.');
        }
      });
    } else {
      $('#trips-modal').modal();
    }
  },
  'click #print-page'(event) {
    event.preventDefault();
    window.print();
  },
});

Template.Admin.onDestroyed(function() {
  Session.delete('tripId');
  Session.delete('showingUserId');
  Session.delete('searchValue');
  Session.delete('documentLimit');
  $(window).unbind('scroll');
});
