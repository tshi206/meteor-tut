import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    // code to run on server at startup
    // Mongo connection needs to be established on both the client and the sever side
    const Resolutions = new Mongo.Collection('resolutions');

    // remote services
    Meteor.methods({
        addResolution: title => {
            Resolutions.insert({
                title : title,
                createdAt : new Date(),
                owner: Meteor.userId()
            });
        },

        updateResolution: (id, checked) => {
            let resolution = Resolutions.findOne(id);
            if (resolution.owner !== Meteor.userId()) {
                throw new Meteor.Error('not-authorized');
            }
            Resolutions.update(id, {$set: {checked: checked}});
        },

        setPrivate: (id, isPrivate) => {
            let resolution = Resolutions.findOne(id);
            if (resolution.owner !== Meteor.userId()) {
                throw new Meteor.Error('not-authorized');
            }
            Resolutions.update(id, {$set: {isPrivate: isPrivate}});
        },

        deleteResolution: id => {
            let resolution = Resolutions.findOne(id);
            if (resolution.owner !== Meteor.userId()) {
                throw new Meteor.Error('not-authorized');
            }
            Resolutions.remove(id);
        }
    });

    // publisher, restrict which parts of the collection we want to relay to the frontend subscriber. For example: if 'return Resolutions.find()', we simply relay every single entries inside the collection 'resolutions' to the subscriber.
    Meteor.publish('resolutions', () => {
        // return Resolutions.find()
        return Resolutions.find({
            $or: [
                { isPrivate: {$ne: true} },
                { owner: Meteor.userId() }
            ]
        })
    });
});
