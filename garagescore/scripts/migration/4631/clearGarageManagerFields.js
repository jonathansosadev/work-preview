db.getCollection('garages').updateMany({}, { 
  $unset : { 'manager' : '', 'managerApv' : '', 'managerVn' : '', 'managerVo' : '' },
})