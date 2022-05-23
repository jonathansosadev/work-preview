var batch = [];
db.garages.find({ phone: /[ \t]+$/ }).forEach(function (doc) {
  batch.push({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { phone: doc.phone.trim() } },
    },
  });
});

if (batch.length) {
  db.garages.bulkWrite(batch);
}
