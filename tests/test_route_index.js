const envs = require('dotenv').config();
const chai = require('chai');
const { describe, before, it } = require('mocha');
const chaiHttp = require('chai-http');
const randomstring = require('randomstring');
const app = require('../app');

const { Logger } = require('../utils/Logger');

const log = new Logger('app');

const { assert } = chai;
const { expect } = chai;

// Configure chai
chai.use(chaiHttp);
chai.should();

function assertNotError(err, res) {
  if (err) {
    log.error(err.message);
    assert.fail(err);
  }
}

function assertHtmlResponse(res) {
  assert.equal(res.status, 200);
  assert.equal(res.headers['content-type'], 'text/html; charset=utf-8');
  assert.isAtLeast(res.text.length, 1); // the html content
}

describe('Test index route', function () {
  this.timeout(10 * 1000);

  before(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should get home page', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        assertNotError(err, res);
        expect(res).to.have.status(200);
        done();
      });
  });
});
