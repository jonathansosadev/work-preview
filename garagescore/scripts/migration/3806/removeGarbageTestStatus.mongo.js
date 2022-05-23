db.getCollection('garages').updateMany({
  status: 'GarbageTest' 
},
{
  $set: {
    'status': 'Stopped',
    'previouslyGarbageTest': true
  }
})