'use strict'

/* eslint no-undef:0 */
var expect = require('chai').expect
var validate = require('../lib/validate')
var fsp = require('fs-promise')
var sinon = require('sinon')
// var Promise = require('promise')
var Logger = require('../lib/logger')

describe('the validator', function () {
  let logger, view, model, readFileStub, infoStub, errorStub

  beforeEach(function () {
    model = JSON.stringify({
      type: 'object',
      properties: {}
    }, null, 2)
    view = JSON.stringify({
      type: 'form',
      version: '2.0',
      cells: [{}]
    }, null, 2)
    logger = new Logger(false)
    infoStub = sinon.stub(logger, 'info')
    errorStub = sinon.stub(logger, 'error')
    readFileStub = sinon.stub(fsp, 'readFile').returns(Promise.resolve(model))
  })

  afterEach(function () {
    fsp.readFile.restore()
  })

  it('exists', function () {
    expect(validate).to.be.ok
  })

  it('validates a good model', function () {
    return validate.validateModel(JSON.parse(model), logger)
      .then((result) => {
        expect(result[0]).to.eql(JSON.parse(model))
      })
  })

  it('validates a view', function () {
    return validate.validateView(JSON.parse(view), logger)
      .then((result) => {
        expect(result[0]).to.eql(JSON.parse(view))
      })
  })

  // TODO: figure out if we can get rid of the Ember dep in bunsen-core
  //       that I think is breaking this test
  // it('validates a model and a view', function () {
  //   expect(validate.validateViewWithModel({}, {}, logger)).to.be.ok
  // })

  it('handles validation for a model', function () {
    return validate.validate('somemodel', undefined, logger)
      .then((result) => {
        expect(infoStub.lastCall.args[0]).to.eql('detected model file')
        expect(result[0]).to.eql(JSON.parse(model))
        expect(result[1]).to.equal('valid Bunsen Model')
      })
  })

  it('handles validation for a view', function () {
    readFileStub.returns(Promise.resolve(view))
    return validate.validate('someview', undefined, logger)
      .then((result) => {
        expect(infoStub.lastCall.args[0]).to.eql('detected bunsen view file')
        expect(result[0]).to.eql(JSON.parse(view))
        expect(result[1]).to.equal('valid Bunsen View')
      })
  })

  it('handles validation for a view against a model', function () {
    readFileStub.withArgs('modelfile').returns(Promise.resolve(model))
    readFileStub.withArgs('viewfile').returns(Promise.resolve(view))
    return validate.validate('modelfile', 'viewfile', logger)
      .then((result) => {
        expect(result).to.eql(JSON.parse(view))
      })
  })

  it('Rejects if first arg is not a coherent JSON blob trying to be a model or a view', function () {
    return validate.validate(undefined, undefined, logger)
      .catch((error) => {
        expect(error).to.be.ok
        expect(errorStub.called).to.be.ok
      })
  })
})
