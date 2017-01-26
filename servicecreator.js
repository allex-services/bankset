function createBankSetService(execlib, ParentService, banksetlib, leveldblib) {
  'use strict';

  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    BankSet = banksetlib.BankSet;
  

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user'), banksetlib, leveldblib) 
    };
  }

  function BankSetService(prophash) {
    ParentService.call(this, prophash);
    prophash.starteddefer = this.readyToAcceptUsersDefer;
    BankSet.call(this, prophash);
    execlib.loadDependencies('client', [prophash.bankmodulename || 'allex:leveldbbank:lib'], this.onBankModule.bind(this, prophash))
  }
  
  ParentService.inherit(BankSetService, factoryCreator);
  BankSet.addMethods(BankSetService);
  
  BankSetService.prototype.__cleanUp = function() {
    BankSet.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  BankSetService.prototype.isInitiallyReady = function () {
    return false;
  };

  BankSetService.prototype.onBankModule = function (prophash, banklib) {
    //convention: banklib is either the ctor itself or a hash with the Bank property
    //if needed, add more prophash properties for extracting the bankctor from banklib
    var bankctor;
    if (!banklib) {
      throw new lib.Error('NO_BANKLIB_MODULE', 'Could not load the specified banklib module');
    }
    console.log('banklib', banklib);
    if (lib.isFunction(banklib.Bank)) {
      bankctor = banklib.Bank;
    }
    if (!bankctor && lib.isFunction(banklib)) {
      bankctor = banklib;
    }
    if (!bankctor) {
      throw new lib.Error('NO_BANK_CONSTRUCTOR', 'Bank constructor could not be found in '+prophash.bankmodulename);
    }
    this.setBankCtor(bankctor);
    prophash = null;
  };

  BankSetService.prototype.propertyHashDescriptor = {
    path: {
      type: 'string'
    }
  };
  
  return BankSetService;
}

module.exports = createBankSetService;
