//TODO: 1. CRUD for trips
// 2. CRUD for Fundraisers
// 3. CRUD for Forms
// 4. CRUD for

// TODO:  Consider using Apollo here instead of HTTP calls to DonorTools, we wouldn't
// even need to store that trip data if we could use apollo
// rp can do async request promise calls to get REST data


Meteor.methods({
  'forms.insertPoem'({ order, grade, author, title, poem }) {
    new SimpleSchema({
      order:  { type: String },
      grade:  { type: String },
      author: { type: String },
      title:  { type: String },
      poem:   { type: String },
    }).validate({ order, grade, author, title, poem });


    if (this.userId && Roles.userIsInRole(this.userId, ['admin'])) {
      Poems.insert({ order: order, grade: grade, author: author, title: title, poem: poem });
    } else {
      throw new Meteor.Error('forms.insertPoem.unauthorized',
        'Cannot insert a form without permission');
    }
  },
  'forms.insertVerse'({ book, chapter, verse, week }) {
    console.log("Got to forms.insertVerse method");
    new SimpleSchema({
      book:       { type: String },
      chapter:    { type: String },
      verse:      { type: String },
      week:       { type: String },
    }).validate({ book, chapter, verse, week });

    if (this.userId && Roles.userIsInRole(this.userId, ['admin'])) {
      const bibleURL = 'https://www.bible.com/bible/59/';
      const verseURL = bibleURL + book + "." + chapter + "." + verse;

      const verseFromBibleCom = getVerse(verseURL);

      Verses.insert({
        book:               book,
        chapter:            chapter,
        verse:              verse,
        bookChapterVerse:   verseFromBibleCom.human,
        text:               verseFromBibleCom.reader_html,
        verseURL:           verseURL,
        week:               week
      });
      console.log("should have inserted verse");
    } else {
      throw new Meteor.Error('forms.insertPoem.unauthorized',
        'Cannot insert a form without permission');
    }
  }
});