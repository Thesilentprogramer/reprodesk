import assert from 'node:assert/strict';
import { test } from 'node:test';
import { actionKind } from './data.js';

test('NEAR RPC string and object actions retain their names', () => {
  assert.equal(actionKind('CreateAccount'), 'CreateAccount');
  assert.equal(actionKind({ FunctionCall: { method_name: 'example' } }), 'FunctionCall');
});
