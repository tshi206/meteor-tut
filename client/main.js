import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

const Resolutions = new Mongo.Collection('resolutions');

// subscribe to the 'resolutions' publisher in server's main.js
Meteor.subscribe("resolutions");

// helpers defined in-memory variables for the selected template ( body-tag in this case )
Template.body.helpers({
    resolutions() {
        console.log(Resolutions.find().fetch());
        // session is no longer bundled in meteor default packages, install it with meteor cli via: meteor add session
        if (Session.get('hideFinished')) {
            return Resolutions.find({checked: {$ne: true}}); // retrieve entries with a non-true checked field value
        }
        return Resolutions.find(); // find all otherwise
    },

    hideFinished() {
        return Session.get('hideFinished');
    }
});

Template.body.events({
    // register an onSubmit event on the form selected by class name 'new-resolution'
    'submit .new-resolution': (event) => {
        event.preventDefault(); // stop the submission from triggering a page reload
        let title = event.target.title.value;

        Meteor.call('addResolution', title);

        event.target.title.value = "";
    },

    'change .hide-finished'(event) {
        Session.set('hideFinished', event.target.checked);
    }
});

Template.resolution.helpers({
    isOwner() {
        // this.owner is referring to the 'owner' fields inside the mongo collection
        // noinspection JSUnresolvedVariable
        return this.owner === Meteor.userId();
    }
});

Template.resolution.events({
    'click .toggle-checked'() {
        Meteor.call("updateResolution", this._id, !this.checked);
    },

    'click .toggle-private'() {
        Meteor.call('setPrivate', this._id, !this.isPrivate);
    },

    'click .delete'() {
        // 'this' refers to resolution template, meteor magics...
        Meteor.call('deleteResolution', this._id);
    }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});

// Template.hello.onCreated(function helloOnCreated() {
//   // counter starts at 0
//   this.counter = new ReactiveVar(0);
// });
//
// Template.hello.helpers({
//   counter() {
//     return Template.instance().counter.get();
//   },
// });
//
// Template.hello.events({
//   'click button'(event, instance) {
//     // increment the counter when button is clicked
//     instance.counter.set(instance.counter.get() + 1);
//   },
// });
