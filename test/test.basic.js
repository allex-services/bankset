var BankSet, // = require('../')(execlib),
  _banknames = ['001', '002', '003'],
  _usernames = ['peter', 'paul', 'mary'];
 
function all(num) {
  var i, j, ret = [], r;
  for (i=0; i<_banknames.length; i++) {
    r = [];
    for (j=0; j<_usernames.length; j++) {
      r.push(num);
    }
    ret.push(r);
  }
  return ret;
}

function popper1 () {
  return {pop:1};
}

function itemprinter (item) {
  console.log('item', item);
}

function accountfiller (bankset, bankname, accountname) {
  return bankset.charge(bankname, accountname, -(1000+(~~(Math.round()*500))), ['fill']);
}

function bankfiller (bankset, bankname) {
  return q.all(_usernames.map(accountfiller.bind(null, bankset, bankname)));
}

function randomAmount (min, max) {
  return min + (~~(Math.random() * (max-min)));
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
  var methodname = args[0], method = bankset[methodname];
  if (!lib.isFunction(method)) {
    throw new Error (methodname+' is not a method of BankSet');
  }
  return method.apply(bankset, args4apply(bankname, banknameindex, accountname, accountnameindex, args));
}

function bankapplier (bankset, args, bankname, banknameindex) {
  return q.all(_usernames.map(accountapplier.bind(null, bankset, bankname, banknameindex, args)));
}

function applytobankset (bankset, args) {
  return q.all(_banknames.map(bankapplier.bind(null, bankset, args)));
}

describe('Basic tests', function () {
  var _reservations;
  function reservationsetter(reservations) {
    _reservations = reservations;
    return q(reservations);
  }
  function reservation4use (bankname, banknameindex, accountname, accountnameindex) {
    var r = _reservations[banknameindex][accountnameindex];
    return {pop:1, should_expand: [r[0], r[1]]};
  }
  loadServerSide(['allex:bankset']);
  it('Set internal variables', function () {
    BankSet = allexbankset;
  });
  it('Instantiate BankSet', function () {
    var d = q.defer(), ret = d.promise;
    _bankset = new BankSet({
      path: 'bankset.db',
      __readyToAcceptUsers: d
    });
    return ret;
  });
  it('Read accounts with default', function () {
    this.timeout(150000);
    return applytobankset(_bankset, ['readAccountWDefault', 0]);
  });
  it('Read accounts safe', function () {
    return applytobankset(_bankset, ['readAccountSafe', 0]);
  });
  it('Fill some accounts with random money', function () {
    return applytobankset(_bankset, ['charge', {_evaluate: randomAmount.bind(null, -2000, -1000)}, ['fill']]);
  });
  it('Close accounts', function () {
    return applytobankset(_bankset, ['closeAccount']);
  });
  it('Read non-existing accounts should throw', function () {
    expect(applytobankset(_bankset, ['readAccount'])).to.be.rejectedWith(/not found in database/);
  });
  it('Read accounts safe', function () {
    return applytobankset(_bankset, ['readAccountSafe', 0]);
  });
  it('Fill some accounts with 1000', function () {
    return applytobankset(_bankset, ['charge', -1000, ['fill']]);
  });
  it('Reserve 300 on accounts', function () {
    return applytobankset(_bankset, ['reserve', 300, ['reserve']]).then(reservationsetter);
  });
  it('Commit reservations on accounts', function () {
    return applytobankset(_bankset, ['commitReservation', {_evaluate: reservation4use}, ['commit']]).then(reservationsetter);
  });
  it('Read accounts', function () {
    expect(applytobankset(_bankset, ['readAccount'])).to.eventually.deep.equal(all(700));
  });
  it('Reserve 300 on accounts', function () {
    return applytobankset(_bankset, ['reserve', 300, ['reserve']]).then(reservationsetter);
  });
  it('Cancel reservations on accounts', function () {
    return applytobankset(_bankset, ['cancelReservation', {_evaluate: reservation4use}, ['cancel']]).then(reservationsetter);
  });
  it('Read accounts', function () {
    expect(applytobankset(_bankset, ['readAccount'])).to.eventually.deep.equal(all(700));
  });
  it('Traverse storage', function () {
    return (applytobankset(_bankset, ['traverseKVStorage', {pop:1, _value: itemprinter}, {}]));
  });
  it('Traverse log', function () {
    return (applytobankset(_bankset, ['traverseLog', {pop:1, _value: itemprinter}, {}]));
  });
  it('Traverse reservations', function () {
    return (applytobankset(_bankset, ['traverseReservations', {pop:1, _value: itemprinter}, {}]));
  });
  it('Traverse resets', function () {
    return (applytobankset(_bankset, ['traverseResets', {pop:1, _value: itemprinter}, {}]));
  });
});


