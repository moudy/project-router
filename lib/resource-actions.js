module.exports = {
  index: {type:'get'}
, new: {type:'get', suffix: 'new'}
, create: {type:'post'}
, show: {type:'get', suffix: ':id'}
, edit: {type:'get', suffix: ':id/edit'}
, update: {type:'put', suffix: ':id'}
, destroy: {type:'delete', suffix: ':id'}
};

