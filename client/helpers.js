import moment from 'moment';
import {
  getRaisedTotalForTrip,
  getDeadlinesTotalForTrip,
  getRaisedTotal,
  getDeadlineTotal,
  getDeadlineAdjustments,
  statuses,
} from '/imports/api/miscFunctions';

Template.registerHelper('formatTime', function(context) {
  if (context) {
    return moment(context).format('MM/DD/YYYY, hh:mma');
  }
});

Template.registerHelper('showTools', function() {
  const routeName = FlowRouter.getRouteName();
  if (routeName) return routeName.includes('admin');
});

Template.registerHelper('submitFormText', function(e) {
  let agreed;
  if (e) {
    const thisForm = Forms.findOne({ name: e, userId: this._id });
    if (thisForm && thisForm.agreed) {
      agreed = `Agreed to on: ${moment(thisForm.agreedDate).format('MM/DD/YYYY')} <i class='fa fa-check'></i>`;
    }
  }
  return {
    'data-loading-text': "Processing... <i class='fa fa-spinner fa-spin'></i>",
    'data-error-text':
      "Hmm...that didn't work. Please look over your form and try again <i class='fa fa-exclamation-triangle'></i>",
    'data-success-text': agreed || "Got it! <i class='fa fa-check'></i>",
  };
});

Template.registerHelper('agreed', function(e) {
  const thisForm = Forms.findOne({ name: e, userId: this._id });
  if (thisForm && thisForm.agreed) {
    Meteor.setTimeout(() => {
      $(`#${e}`).button('success');
      $(`#${e}`).tooltip();
    }, 200);
    return {
      disabled: 'disabled',
    };
  }
  if (
    Roles.userIsInRole(Meteor.userId(), 'admin') &&
    Meteor.user()._id !== Session.get('showingUserId')
  ) {
    // Admins can't agree to terms for another user, only the user can do this
    return { disabled: 'disabled' };
  }
});

Template.registerHelper('passportPhotoThumbnail', function() {
  if (this.versions && this.versions.thumbnail) {
    console.log(this.versions.thumbnail.meta.signedURL);
    return this.versions.thumbnail.meta.signedURL;
  }
});

Template.registerHelper('passportPhotoOriginal', function() {
  if (this.versions && this.versions.original) {
    return this.versions.original.meta.signedURL;
  }
});

Template.registerHelper('noTripRegistration', function() {
  const tripId =
    Meteor.users.findOne({ _id: this._id }) &&
    Meteor.users.findOne({ _id: this._id }).tripId;
  if (tripId) {
  } else {
    const trips =
      Meteor.users.findOne({ _id: this._id }) &&
      Meteor.users.findOne({ _id: this._id }).otherTrips;
    if (trips) {
      return;
    }
    return {
      style: 'background-color: #eee',
    };
  }
});

Template.registerHelper('otherTripsRegistration', function() {
  const trips =
    Meteor.users.findOne({ _id: this._id }) &&
    Meteor.users.findOne({ _id: this._id }).otherTrips;
  if (trips) {
    return true;
  }
  return false;
});

Template.registerHelper('noTripRegistrationExpand', function() {
  const tripId =
    Meteor.users.findOne({ _id: this._id }) &&
    Meteor.users.findOne({ _id: this._id }).tripId;
  if (tripId) {
    return {
      style: 'display: none;',
    };
  }
});

Template.registerHelper('oddEven', function(index) {
  if (index % 2 === 0) return 'even';
  return 'odd';
});

Template.registerHelper('selected', function(key, value) {
  if (this[key] && this[key] === value) {
    return { selected: 'selected' };
  }
});

Template.registerHelper('checked', function(name, value) {
  if (this[name] === value) {
    return { checked: 'checked' };
  }
});

Template.registerHelper('multiChecked', function(name, value) {
  if (this[name] && this[name].indexOf(value) !== -1) {
    return { checked: 'checked' };
  }
});

Template.registerHelper('editedClass', function(value) {
  if (value) {
    return 'edited';
  }
});

Template.registerHelper('appVersion', function() {
  return '1.3.6';
});

Template.registerHelper('thisYear', function() {
  const d = new Date();
  const year = d.getFullYear();
  return year;
});

Template.registerHelper('thisUserIsInRole', function(_id, role) {
  return Roles.userIsInRole(_id, role.split(', '));
});

Template.registerHelper('formatDate', function(date) {
  const newDate = moment(new Date(date)).format('MM/DD/YYYY');
  return newDate;
});

Template.registerHelper('formatMoney', function(amount) {
  return amount.toLocaleString();
});

Template.registerHelper('totalRaisedForTrip', function() {
  const totalRaised = getRaisedTotalForTrip(Session.get('tripId'));
  return Number(totalRaised).toLocaleString();
});

Template.registerHelper('totalNeededForTrip', function() {
  const tripId = Number(Session.get('tripId'));
  const totalNeeded = getDeadlinesTotalForTrip(tripId);
  const users = Meteor.users.find({ tripId });
  return Number(totalNeeded * users.count()).toLocaleString();
});

Template.registerHelper('raisedAmount', function() {
  const raisedTotal = getRaisedTotal(this._id);
  const deadlineTotal = getDeadlineTotal(this._id);
  const deadlineAdjustments = getDeadlineAdjustments(this._id);
  const deadlineTotalWithAdjustments =
    Number(deadlineTotal) + Number(deadlineAdjustments);
  if (raisedTotal > 0) {
    return `$${Number(raisedTotal).toLocaleString()} raised of $${Number(deadlineTotalWithAdjustments).toLocaleString()} total`;
  }
  return statuses.notStarted;
});

Template.registerHelper('needToRaiseThisAmount', function() {
  // Is there at least one deadline?
  if (this && this.count() > 0) {
    const raisedTotal = getRaisedTotal(Session.get('showingUserId'));
    const deadlineTotal = getDeadlineTotal(Session.get('showingUserId'));
    const deadlineAdjustments = getDeadlineAdjustments(Session.get('showingUserId'));
    const needToRaiseThisAmount = deadlineTotal - raisedTotal;
    const deadlineTotalWithAdjustments =
      Number(needToRaiseThisAmount) + Number(deadlineAdjustments);
    if (deadlineAdjustments > 0) {
      return `Your deadline adjustment = $${deadlineAdjustments}<br/>$${deadlineTotalWithAdjustments}`;
    }
    return `$${deadlineTotalWithAdjustments}`;
  }
});

Template.registerHelper('showTripRaisedTotal', function() {
  const splits = DTSplits.find({ fund_id: this.tripId });
  if (splits && splits.count() > 0) {
    const total_in_cents = splits.map(function(item) {
      return item.amount_in_cents;
    });
    const sum = total_in_cents.reduce(add, 0);

    function add(a, b) {
      return a + b;
    }
    const deadlineTotal = getDeadlineTotal(this._id);
    const returnAmount = (sum / 100).toFixed(2);
    return `** $${Number(returnAmount).toLocaleString()} raised of $${Number(deadlineTotal).toLocaleString()} total`;
  }
  return '** 0';
});

Template.registerHelper('showFundraisingModule', function() {
  if (this.tripId) {
    const trip = Trips.findOne({ tripId: this.tripId });
    if (trip) {
      return trip.showFundraisingModule;
    }
  }
});

Template.registerHelper('status', function() {
  const tripId =
    Meteor.users.findOne({ _id: this._id }) &&
    Meteor.users.findOne({ _id: this._id }).tripId;
  const passportImage = Images.findOne({ userId: this._id });
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
        const verifiedForms = Forms.find({ userId: this._id, verified: true });
        const totalNumberOfForms = verifiedForms && verifiedForms.count();
        if (totalNumberOfForms === 4) {
          return statuses.verified;
        }
        return statuses.completed;
      }
      return statuses.needPassportPic;
    }
    return statuses.inProgress;
  }
  return statuses.notStarted;
});

Template.registerHelper('formStarted', function(name) {
  const form = Forms.findOne({
    name,
    userId: this._id,
    archived: { $ne: true },
  });
  return form;
});

Template.registerHelper('formCompleted', function(name) {
  const form = Forms.findOne({
    name,
    userId: this._id,
    $or: [{ completed: true }, { agreed: true }],
    archived: { $ne: true },
  });
  return form;
});

Template.registerHelper('formVerified', function(name) {
  return Forms.findOne({
    name,
    userId: this._id,
    verified: true,
    archived: { $ne: true },
  });
});

Template.registerHelper('ShowFundraisingModule', function() {
  let user;
  if (Session.get('showingOtherUser')) {
    user = this;
  } else {
    user = Meteor.user();
  }
  if (user && user.tripId) {
    const trip = Trips.findOne({ tripId: user.tripId });
    return trip && trip.showFundraisingModule;
  }
});

Template.registerHelper('imageExists', function() {
  return Images.find({ userId: this._id }).count();
});

Template.registerHelper('users', function() {
  if (tripId.get()) {
    return Meteor.users.find({ tripId: tripId.get() });
  }
});

Template.registerHelper('images', function() {
  return Images.find({ userId: this._id }).fetch()[0];
});

Template.registerHelper('fullName', function(parentContext) {
  if (parentContext) {
    const profile =
      parentContext && parentContext.profile && parentContext.profile;
    return `${profile && profile.firstName} ${profile && profile.lastName}`;
  }
  return `${this.profile &&
    this.profile.firstName} ${this.profile && this.profile.lastName}`;
});

Template.registerHelper('pathFor', function(path, view) {
  let hashBang,
    query,
    ref;
  if (view == null) {
    view = {
      hash: {},
    };
  }
  if (!path) {
    throw new Error('no path defined');
  }
  if (!view.hash) {
    view = {
      hash: view,
    };
  }
  if (((ref = path.hash) != null ? ref.route : void 0) != null) {
    view = path;
    path = view.hash.route;
    delete view.hash.route;
  }
  query = view.hash.query ? FlowRouter._qs.parse(view.hash.query) : {};
  hashBang = view.hash.hash ? view.hash.hash : '';
  return (
    FlowRouter.path(path, view.hash, query) + (hashBang ? `#${hashBang}` : '')
  );
});
