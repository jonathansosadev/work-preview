db.getCollection('garages').find(
  {publicDisplayName:/\s\s/}
).forEach(function(garage) {
    db.garages.updateOne({
        _id: garage._id
    }, {
        $set: {
            publicDisplayName: garage.publicDisplayName.replace(/  +/g, ' ')
        }
    })
});