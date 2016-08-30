
// Get icon about text
Meteor.publish('IconAbout', function () {
  return IconAbout.find();
});

// Get poems
Meteor.publish('Poems', function () {
  return Poems.find({}, { sort: { order: 1 } } );
});

// Get verses
Meteor.publish('Verses', function () {
  return Verses.find({}, { sort: { week: 1 } } );
});