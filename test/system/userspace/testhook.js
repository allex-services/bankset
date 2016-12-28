var _banknames = ['001', '002', '003'],
  _usernames = ['peter', 'paul', 'mary'],
  _reservations;

loadMochaIntegration('allex_leveldblib');

function leveldbsetter (_leveldblib) {
  //console.log(_leveldblib);
  leveldblib = _leveldblib;
  return q(true);
}

function randomAmount (min, max) {
  return min + (~~(Math.random() * (max-min)));
}

function reservationsetter(reservations) {
  _reservations = reservations;
  return q(reservations);
}

function reservation4use (bankname, banknameindex, accountname, accountnameindex) {
  var r = _reservations[banknameindex][accountnameindex];
  return {pop:1, should_expand: [r[0], r[1]]};
}

function args4apply (bankname, banknameindex, accountname, accountnameindex, args) {
  var ret = [bankname, accountname], i, arg, j, dopush;
  for (i=1; i<args.length; i++) {
    dopush = true;
    arg = args[i];
    if (arg.hasOwnProperty('_evaluate') && lib.isFunction(arg._evaluate)) {
      arg = arg._evaluate(bankname, banknameindex, accountname, accountnameindex);
    }
    if (arg && arg.hasOwnProperty('pop')) {
      for (j=0; j<arg.pop; j++) {
        ret.pop();
      }
    }
    if (arg && arg.hasOwnProperty('should_expand') && lib.isArray(arg.should_expand)) {
      while(arg.should_expand.length) {
        ret.push(arg.should_expand.shift());
      }
      dopush = false;
    }
    if (arg && arg.hasOwnProperty('_value')) {
      arg = arg._value;
    }
    if (dopush) {
      ret.push (arg);
    }
  }
  return ret;
}

function accountapplier (bankset, bankname, banknameindex, args, accountname, accountnameindex) {
  /*
  var methodname = args[0], method = bankset[methodname];
  if (!lib.isFunction(method)) {
    throw new Error (methodname+' is not a method of BankSet');
  }
  return method.apply(bankset, args4apply(bankname, banknameindex, accountname, accountnameindex, args));
  */
  var myargs = args4apply(bankname, banknameindex, accountname, accountnameindex, args);
  myargs.unshift(args[0]);
  //console.log('call.apply', myargs);
  return bankset.call.apply(bankset, myargs);
}

function bankapplier (bankset, args, bankname, banknameindex) {
  return q.all(_usernames.map(accountapplier.bind(null, bankset, bankname, banknameindex, args)));
}

function applytobankset (bankset, args) {
  return q.all(_banknames.map(bankapplier.bind(null, bankset, args)));
}


function test (caption, sink, args, then) {
  return function () {
    var p = qlib.promise2console(applytobankset(sink, args), caption),
      d = q.defer(),
      ret = d.promise;
    caption = null;
    sink = null;
    args = null;
    if (then) {
      p = p.then(then);
    }
    p.then(d.resolve.bind(d), d.resolve.bind(d, true), d.notify.bind(d));
    return ret;
  }
}


function bankstreamer (sink, method, options, bankname) {
  console.log('streamInSink', method, options, bankname);
  return leveldblib.streamInSink(sink, method, [bankname, options], console.log.bind(console, 'item'), function (d) {d.resolve(true)});
}

function stream (caption, sink, method, options) {
  var _bns = _banknames;
  return function () {
    var ret = q.all(_bns.map(bankstreamer.bind(null, sink, method, options)));
    _bns = null;
    sink = null;
    method = null;
    options = null;
    return ret;
  };
  //return leveldblib.streamInSink.bind(null, sink, 'traverseAccounts', ['001', {pagesize:5}], console.log.bind(console, 'item'), function (d) {d.resolve(true)});
}


function go (taskobj) {
  'use strict';
  var pej;
  if (!taskobj) {
    process.exit(1);
    return;
  }
  if (!taskobj.sink) {
    process.exit(0);
    return;
  }
  lib = taskobj.execlib.lib;
  q = lib.q;
  qlib = lib.qlib;
  taskobj.execlib.loadDependencies('client', ['allex:leveldb:lib'], leveldbsetter).then(runTests.bind(null, taskobj));
}

describe('Basic tests', function () {
  loadClientSide(['allex:leveldb:lib']);
  it('Connect', function () {
    return findSink({
      sinkname: 'BankSet',
      identity: {name: 'user', role: 'user'},
      task: {
        name: go
      }
    });
  });
  createSinkLevelDBHookIt({
    instancename: 'HookPeter',
    sinkname: 'BankSet',
    hookTo: {keys:['***', 'peter'], scan: true},
    cb: console.log.bind(console, 'peter:')
  });
  it('Test Hook', function () {
    var ret = HookPeter.wait();
    BankSet.call('charge', '001', 'peter', -100, ['test charge']);
    return expect(ret).to.eventually.equal(1);
  });
});


module.exports = {
  sinkname: 'BankSet',
  identity: {name: 'user', role: 'user'},
  task: {
    name: go
  }
};
