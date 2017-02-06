function createUser(execlib, ParentUser, banksetlib, leveldblib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    QuerableUserSessionMixin = leveldblib.QuerableUserSessionMixin,
    qmpd = QuerableUserSessionMixin.queryMethodParamDescriptor,
    UserSession;

  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  UserSession = ParentUser.prototype.getSessionCtor('.');


  function KVStorageSession (user, session, gate) {
    UserSession.call(this, user, session, gate);
    QuerableUserSessionMixin.call(this);
  }

  UserSession.inherit(KVStorageSession, {
    query: qmpd,
    queryLog: qmpd,
    stopQuery: QuerableUserSessionMixin.stopQueryMethodDescriptor
  });
  QuerableUserSessionMixin.addMethods(KVStorageSession);

  KVStorageSession.prototype.__cleanUp = function () {
    QuerableUserSessionMixin.prototype.destroy.call(this);
    UserSession.prototype.__cleanUp.call(this);
  };

  function selfservice(service) {
    return service;
  }
  KVStorageSession.prototype.query = QuerableUserSessionMixin.queryMethodGenerator(selfservice, 'query');
  /*
  KVStorageSession.prototype.query = function (dbname, filterdesc, scaninitially, defer) {
    console.log('query', dbname, filterdesc);
    defer.resolve(0);
  };
  */
  KVStorageSession.prototype.queryLog = QuerableUserSessionMixin.queryMethodGenerator(selfservice, 'queryLog');


  function User(prophash) {
    ParentUser.call(this, prophash);
    leveldblib.ServiceUserMixin.call(this);
  }
  
  ParentUser.inherit(User, require('../methoddescriptors/user'), [/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  leveldblib.ServiceUserMixin.addMethods(User);
  User.prototype.__cleanUp = function () {
    leveldblib.ServiceUserMixin.prototype.__cleanUp.call(this);
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.readAccount = function (bankname, username, defer) {
    qlib.promise2defer(this.__service.readAccount(bankname, username), defer);
  };

  User.prototype.readAccountWDefault = function (bankname, username, dflt, defer) {
    qlib.promise2defer(this.__service.readAccountWDefault(bankname, username, dflt), defer);
  };

  User.prototype.readAccountSafe = function (bankname, username, dflt, defer) {
    qlib.promise2defer(this.__service.readAccountSafe(bankname, username, dflt), defer);
  };

  User.prototype.charge = function (bankname, username, amount, referencearry, defer) {
    qlib.promise2defer(this.__service.charge(bankname, username, amount, referencearry), defer);
  };

  User.prototype.reserve = function (bankname, username, amount, referencearry, defer) {
    qlib.promise2defer(this.__service.reserve(bankname, username, amount, referencearry), defer);
  };

  User.prototype.commitReservation = function (bankname, reservationid, controlcode, referencearry, defer) {
    qlib.promise2defer(this.__service.commitReservation(bankname, reservationid, controlcode, referencearry), defer);
  };

  User.prototype.partiallyCommitReservation = function (bankname, reservationid, controlcode, commitamount, referencearry, defer) {
    qlib.promise2defer(this.__service.partiallyCommitReservation(bankname, reservationid, controlcode, commitamount, referencearry), defer);
  };

  User.prototype.cancelReservation = function (bankname, reservationid, controlcode, referencearry, defer) {
    qlib.promise2defer(this.__service.cancelReservation(bankname, reservationid, controlcode, referencearry), defer);
  };

  User.prototype.closeAccount = function (bankname, username, defer) {
    qlib.promise2defer(this.__service.closeAccount(bankname, username), defer);
  };

  User.prototype.traverseAccounts = function (bankname, options, defer) {
    this.performLevelDBStreaming(bankname, options, 'kvstorage', defer);
  };

  User.prototype.traverseTransactions = function (bankname, options, defer) {
    this.performLevelDBStreaming(bankname, options, 'log', defer);
  };

  User.prototype.traverseReservations = function (bankname, options, defer) {
    this.performLevelDBStreaming(bankname, options, 'reservations', defer);
  };

  User.prototype.performLevelDBStreaming = function (bankname, options, dbname, defer) {
    this.__service.getOrCreateBank(bankname).then(
      this.doTheStreamLevelDB.bind(this, options, defer, dbname),
      defer.reject.bind(defer)
    );
  };

  User.prototype.doTheStreamLevelDB = function (options, defer, dbname, bank) {
    this.streamLevelDB(bank[dbname], options, defer);
  };

  User.prototype.getSessionCtor = execSuite.userSessionFactoryCreator(KVStorageSession);

  return User;
}

module.exports = createUser;
