loadMochaIntegration('allex_leveldblib');

var _balance = {
  '001': {},
  '002': {}
};

function peterBalanceSaver (kva) {
  console.log('peterBalanceSaver', kva);
  if(kva && kva.length && kva.length==2) {
    _balance[kva[0][0]].peter = kva[1];
  }
}

describe('Basic tests', function () {
  loadClientSide(['allex_leveldblib']);
  it('Connect', function () {
    return findSink({
      sinkname: 'BankSet',
      identity: {name: 'user', role: 'user'}
    });
  });
  createSinkLevelDBQueryIt({
    instancename: 'QueryPeter',
    sinkname: 'BankSet',
    scaninitially: true,
    filter: {
      keys: {
        op: 'eq',
        field: null,
        value: 'peter'
      }
    },
    cb: peterBalanceSaver
  });
  createSinkLevelDBQueryIt({
    instancename: 'QueryPeterTxn',
    methodname: 'queryLog',
    sinkname: 'BankSet',
    scaninitially: true,
    filter: {
      values: {
        op: 'eq',
        field: 0,
        value: 'peter'
      }
    },
    cb: null//console.log.bind(console, 'peter txn')
  });
  createSinkLevelDBQueryIt({
    instancename: 'QueryPeterTxn001002',
    methodname: 'queryLog',
    sinkname: 'BankSet',
    scaninitially: false,
    filter: {
      bankname: ['001', '002'],
      values: {
        op: 'eq',
        field: 0,
        value: 'peter'
      }
    },
    cb: null//console.log.bind(console, 'peter txn 001002')
  });
  createSinkLevelDBQueryIt({
    instancename: 'QueryMaryTxn001002',
    methodname: 'queryLog',
    sinkname: 'BankSet',
    scaninitially: false,
    filter: {
      bankname: ['001', '002'],
      values: {
        op: 'eq',
        field: 0,
        value: 'mary'
      }
    },
    cb: console.log.bind(console, 'mary txn 001002')
  });
  it('Test Query', function () {
    var hpret = QueryPeter.wait(), hptret = QueryPeterTxn.wait(), hptret12 = QueryPeterTxn001002.wait();
    BankSet.call('charge', '001', 'peter', -100, ['test charge']);
    expect(hptret).to.eventually.have.deep.property('[1][2]', _balance['001'].peter+100);
    expect(hptret12).to.eventually.have.deep.property('[1][2]', _balance['001'].peter+100);
    return expect(hpret).to.eventually.have.property(1, _balance['001'].peter+100);
  });
  it('Test Query 2', function () {
    var hptret12 = QueryPeterTxn001002.wait();
    BankSet.call('charge', '002', 'peter', -100, ['test charge']);
    return expect(hptret12).to.eventually.have.deep.property('[1][2]', _balance['002'].peter+100);
  });
  it('Test Query 3', function () {
    var hptret12 = QueryPeterTxn001002.wait(), hmtret12 = QueryMaryTxn001002.wait();
    BankSet.call('charge', '002', 'mary', -100, ['test charge']);
    return expect(hmtret12).to.eventually.have.deep.property('[1][2]', _balance['002'].peter+100);
  });
});
