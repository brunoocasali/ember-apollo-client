import EmberObject from '@ember/object';
import { ComponentQueryManager } from 'ember-apollo-client';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Mixin | component query manager', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.subject = function () {
      let TestObject = EmberObject.extend(ComponentQueryManager);
      this.owner.register('test-container:test-object', TestObject);
      return this.owner.lookup('test-container:test-object');
    };
  });

  test('it unsubscribes from any watchQuery subscriptions', async function (assert) {
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.apollo.apollo;
    apolloService.set('managedWatchQuery', (manager, opts) => {
      assert.deepEqual(opts, { query: 'fakeQuery' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    await subject.apollo.watchQuery({ query: 'fakeQuery' });
    await subject.apollo.watchQuery({ query: 'fakeQuery' });

    subject.willDestroyElement();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per watchQuery'
    );
  });

  test('it unsubscribes from any subscriptions', async function (assert) {
    let subject = this.subject();
    let unsubscribeCalled = 0;

    let apolloService = subject.apollo.apollo;
    apolloService.set('managedSubscribe', (manager, opts) => {
      assert.deepEqual(opts, { query: 'fakeSubscription' });
      manager.trackSubscription({
        unsubscribe() {
          unsubscribeCalled++;
        },
      });
      return {};
    });

    await subject.apollo.subscribe({ query: 'fakeSubscription' });
    await subject.apollo.subscribe({ query: 'fakeSubscription' });

    subject.willDestroyElement();
    assert.equal(
      unsubscribeCalled,
      2,
      '_apolloUnsubscribe() was called once per subscribe'
    );
  });
});
