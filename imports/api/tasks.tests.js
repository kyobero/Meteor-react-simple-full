/* eslint-env mocha */
 
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base'
 
import { Tasks } from './tasks.js';
 
if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
      const username = 'chobe'
      let taskId, userId;
 
      before(() => {
        // Create user if not already created
        const user = Meteor.users.findOne({username: username});
        if (!user) {
          userId = Accounts.createUser({
            'username': username,
            'email': 'chobe@meltwater.org',
            'password': '12345678'
          })
        } else {
          userId = user._id
        }
      })
 
      beforeEach(() => {
        Tasks.remove({});
        taskId = Tasks.insert({
          text: 'test task',
          createdAt: new Date(),
          owner: userId,
          username: 'tmeasday',
        });
      });

      // remove method tests
      it('can delete task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];
 
        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };
 
        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);
 
        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 0);
      });
      it("cannot delete someone else's private task", () => {
        // Set existing task private
        Tasks.update(taskId, { $set: { private: true} });

        // Generate random ID to rep. another user
        const anotherUserId = Random.id();

        // Isolate delete method
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Create fake userId object for method
        const fakeUserObject = { 'userId': anotherUserId };

        // Verify that exception is thrown
        assert.throws(function() {
          deleteTask.apply(fakeUserObject, [taskId]);
        }, Meteor.Error, 'not-authorized');

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });
      it("can delete someone else's public task", () => {
        // Generate random ID to rep. another user
        const anotherUserId = Random.id();

        // Isolate delete method
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Create fake userId object for method
        const fakeUserObject = { 'userId': anotherUserId };

        deleteTask.apply(fakeUserObject, [taskId]);

        // Verify that task is deleted
        assert.equal(Tasks.find().count(), 0);
      })

      // insert method tests
      it('can insert task', () => {
        // Create task string
        const text = 'Hello!'

        // Get method
        const insertTask = Meteor.server.method_handlers['tasks.insert']

        // Create fake user object
        const fakeUserObject = { userId }

        // Run test
        insertTask.apply(fakeUserObject, [text])
        assert.equal(Tasks.find().count(), 2)
      });
      it('cannot insert task if not logged in', () => {
        // Create task string
        const text = 'Hello!'

        // Get method
        const insertTask = Meteor.server.method_handlers['tasks.insert']

        // Run test
        assert.throws(function() {
          insertTask.apply({}, [text])
        }, Meteor.Error, /not-authorized/)
        assert.equal(Tasks.find().count(), 1)
      })

      // setChecked method tests
      it('can set task checked', () => {
        // Get method
        const setChecked = Meteor.server.method_handlers['tasks.setChecked']

        // Create fake user object
        const fakeUserObject = { userId }

        // Run test
        setChecked.apply(fakeUserObject, [taskId, true])
        assert.equal(Tasks.find({checked: true}).count(), 1)
      })
      it("cannot set someone else's private task checked", () => {
        // Set task to private
        Tasks.update(taskId, { $set: { private: true } })

        // Generate a random ID, rep. a different user
        const anotherUserId = Random.id();

        // Run test
        const setChecked = Meteor.server.method_handlers['tasks.setChecked']
        const fakeUserObject = { 'userId': anotherUserId }

        // Verify that error is thrown
        assert.throws(function() {
          setChecked.apply(fakeUserObject, [taskId, true])
        }, Meteor.Error, /not-authorized/)

        // Verify that task is not checked
        assert.equal(Tasks.find({checked: true}).count(), 0)
      })

      // setPrivate method tests
      it('can set task private', () => {
        // Get method
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate']

        // Create fake user object
        const fakeUserObject = { userId }

        // Run tests
        setPrivate.apply(fakeUserObject, [taskId, true])
        assert.equal(Tasks.find({private: true}).count(), 1)
      })
      it("cannot set someone else's private task private", () =>{
        // Generate a random ID, rep a different user        
        const anotherUserId = Random.id()

        // Get method
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate']

        // Create fake user object
        const fakeUserObject = {'userId': anotherUserId}

        // Verify that error is thrown
        assert.throws(function() {
          setPrivate.apply(fakeUserObject, [taskId, true])
        }, Meteor.Error, /not-authorized/)

        // Verify that task is not set private
        assert.equal(Tasks.find({private: true}).count(), 0)
      })
    });
  });
}