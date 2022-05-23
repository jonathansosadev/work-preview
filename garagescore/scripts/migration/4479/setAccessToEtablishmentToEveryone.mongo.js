db.getCollection('User').updateMany({ 'authorization.ACCESS_TO_ANALYTICS': true }, 
  { 
    $set: { 'authorization.ACCESS_TO_TEAM': true }, 
    $unset : { 'authorization.ACCESS_TO_ANALYTICS' : '' }
  }
);

db.getCollection('User').updateMany({}, 
  { 
    $set: { 'authorization.ACCESS_TO_ESTABLISHMENT': true }
  }
);