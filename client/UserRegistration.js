import { Session } from 'meteor/session'

Template.UserRegistration.helpers({
  user(){
    return Meteor.user();
  },
  getStates(){
    const states = [
      { stateAbbr: "", name: ""},
      { stateAbbr: "AL", name: "Alabama"},
      { stateAbbr: "AK", name: "Alaska"},
      { stateAbbr: "AZ", name: "Arizona"},
      { stateAbbr: "AR", name: "Arkansas"},
      { stateAbbr: "CA", name: "California"},
      { stateAbbr: "CO", name: "Colorado"},
      { stateAbbr: "CT", name: "Connecticut"},
      { stateAbbr: "DE", name: "Delaware"},
      { stateAbbr: "DC", name: "District Of Columbia"},
      { stateAbbr: "FL", name: "Florida"},
      { stateAbbr: "GA", name: "Georgia"},
      { stateAbbr: "HI", name: "Hawaii"},
      { stateAbbr: "ID", name: "Idaho"},
      { stateAbbr: "IL", name: "Illinois"},
      { stateAbbr: "IN", name: "Indiana"},
      { stateAbbr: "IA", name: "Iowa"},
      { stateAbbr: "KS", name: "Kansas"},
      { stateAbbr: "KY", name: "Kentucky"},
      { stateAbbr: "LA", name: "Louisiana"},
      { stateAbbr: "ME", name: "Maine"},
      { stateAbbr: "MD", name: "Maryland"},
      { stateAbbr: "MA", name: "Massachusetts"},
      { stateAbbr: "MI", name: "Michigan"},
      { stateAbbr: "MN", name: "Minnesota"},
      { stateAbbr: "MS", name: "Mississippi"},
      { stateAbbr: "MO", name: "Missouri"},
      { stateAbbr: "MT", name: "Montana"},
      { stateAbbr: "NE", name: "Nebraska"},
      { stateAbbr: "NV", name: "Nevada"},
      { stateAbbr: "NH", name: "New Hampshire"},
      { stateAbbr: "NJ", name: "New Jersey"},
      { stateAbbr: "NM", name: "New Mexico"},
      { stateAbbr: "NY", name: "New York"},
      { stateAbbr: "NC", name: "North Carolina"},
      { stateAbbr: "ND", name: "North Dakota"},
      { stateAbbr: "OH", name: "Ohio"},
      { stateAbbr: "OK", name: "Oklahoma"},
      { stateAbbr: "OR", name: "Oregon"},
      { stateAbbr: "PA", name: "Pennsylvania"},
      { stateAbbr: "RI", name: "Rhode Island"},
      { stateAbbr: "SC", name: "South Carolina"},
      { stateAbbr: "SD", name: "South Dakota"},
      { stateAbbr: "TN", name: "Tennessee"},
      { stateAbbr: "TX", name: "Texas"},
      { stateAbbr: "UT", name: "Utah"},
      { stateAbbr: "VT", name: "Vermont"},
      { stateAbbr: "VA", name: "Virginia"},
      { stateAbbr: "WA", name: "Washington"},
      { stateAbbr: "WV", name: "West Virginia"},
      { stateAbbr: "WI", name: "Wisconsin"},
      { stateAbbr: "WY", name: "Wyoming"}
    ];
    const state = this && this.profile && this.profile.address && this.profile.address.state;
    states.map(function (thisState) {
      if(thisState.stateAbbr === state){
        thisState.selected = "selected";
      }
      return thisState;
    });
    return states;
  }
});