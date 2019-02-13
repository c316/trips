import { App } from '/imports/ui/js/app';
import { bertError, bertSuccess } from '../../imports/api/utils';

Template.VerifyForms.onCreated(function() {
  Meteor.call('updateExpiredSignedURLS');

  Session.set('verifying', true);
  const tripId = Meteor.user() && Meteor.user().tripId;
  this.autorun(() => {
    this.subscribe('files.images', Session.get('userId'), tripId);
    this.subscribe('Forms', Session.get('userId'));
    this.subscribe('user', Session.get('userId'));
  });
});

Template.VerifyForms.helpers({
  user() {
    return Meteor.users.findOne({ _id: Session.get('userId') });
  },
  imageExists() {
    return Images.find().count();
  },
  thisUserImageExists() {
    return Images.find({ userId: this._id }).count();
  },
  images() {
    return Images.find().fetch()[0];
  },
  thisUserImages() {
    return Images.find({ userId: this._id }).fetch()[0];
  },
});

Template.VerifyForms.events({
  'click .already-verified'(e) {
    const nextId = $('.tab-pane.active')
      .next()
      .attr('id');
    const formName = e.target.getAttribute('data-form-name');
    if (formName === 'passportImage') {
      FlowRouter.go('/leader');
    } else {
      $(`a[href="#${nextId}"]`).click();
    }
    App.scrollTo($('.steps'));
  },
  'click .verified'(event) {
    const nextId = $('.tab-pane.active')
      .next()
      .attr('id');
    console.log(nextId);
    const formName = event.target.getAttribute('data-form-name');

    Meteor.call('form.verify', formName, this._id, function(err, res) {
      if (err) {
        console.error(err);
        bertError('Error', err.reason);
      } else {
        console.log(res);
        if (formName === 'passportImage') {
          FlowRouter.go('/leader');
        } else {
          $(`a[href="#${nextId}"]`).click();
        }
        bertSuccess('', 'Verified');
        App.scrollTo($('.steps'));
      }
    });
  },
  'click .next'() {
    console.log('clicked verified');
    const nextId = $('.tab-pane.active')
      .next()
      .attr('id');
    console.log(nextId);
    $(`a[href="#${nextId}"]`).click();
    App.scrollTo($('.steps'));
  },
  'click #skip-photo'() {
    console.log('clicked skip-photo');
    App.scrollTo($('.portlet-title'));
    FlowRouter.go('/leader');
  },
});

Template.VerifyForms.onDestroyed(function() {
  Session.delete('userId');
  Session.delete('tripId');
  Session.delete('verifying');
});
