module.exports = {
  readAccount: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Username',
    type: 'string'
  }],
  readAccountWDefault: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Username',
    type: 'string'
  },{
    title: 'Default'
  }],
  readAccountSafe: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Username',
    type: 'string'
  },{
    title: 'Default'
  }],
  charge: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Username',
    type: 'string'
  },{
    title: 'Amount',
    type: 'integer'
  },{
    title: 'Reference array',
    type: 'array'
  }],
  reserve: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Username',
    type: 'string'
  },{
    title: 'Amount',
    type: 'integer'
  },{
    title: 'Reference array',
    type: 'array'
  }],
  commitReservation: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Reservation ID',
    type: 'integer'
  },{
    title: 'Control Code',
    type: 'string'
  },{
    title: 'Reference array',
    type: 'array'
  }],
  partiallyCommitReservation: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Reservation ID',
    type: 'integer'
  },{
    title: 'Control Code',
    type: 'string'
  },{
    title: 'Commit Amount',
    type: 'integer'
  },{
    title: 'Reference array',
    type: 'array'
  }],
  cancelReservation: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Reservation ID',
    type: 'integer'
  },{
    title: 'Control Code',
    type: 'string'
  },{
    title: 'Reference array',
    type: 'array'
  }],
  closeAccount: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Username',
    type: 'string'
  }],
  traverseAccounts: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Traverse options',
    type: 'object'
  }],
  traverseTransactions: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Traverse options',
    type: 'object'
  }],
  traverseReservations: [{
    title: 'Bank Name',
    type: 'string'
  },{
    title: 'Traverse options',
    type: 'object'
  }],
};
