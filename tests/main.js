import assert from "assert";
import "../imports/api/tasks.tests.js";
import { Meteor } from 'meteor/meteor';
import "../imports/api/tasks.tests.js";
//import { Random } from 'meteor/random';
 
//import { Tasks } from './tasks.js';
//import { assert } from 'chai';


describe("simple-todos-react", function () {
  it("package.json has correct name", async function () {
    const { name } = await import("../package.json");
    assert.strictEqual(name, "simple-todos-react");
  });

  if (Meteor.isClient) {
    it("client is not server", function () {
      assert.strictEqual(Meteor.isServer, false);
    });
  }

  if (Meteor.isServer) {
    it("server is not client", function () {
      assert.strictEqual(Meteor.isClient, false);
    });
  }

  if (Meteor.isServer) {
    describe('Tasks', () => {
      describe('methods', () => {
        it('can delete owned task', () => {
       
        });
      });
    });
  }

});
