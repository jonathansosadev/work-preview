/**
 *
 * A lookup preserving the order
 *
 * https://stackoverflow.com/questions/55033804/aggregate-lookup-does-not-return-elements-original-array-order
 *
 * Same that 
 * {
      $lookup: {
        from,
        localField,
        foreignField,
        as,
      },
    }
    but the order of the localField is preserved
 */

module.exports = ({ from, localField, foreignField, as }) => ({
  $lookup: {
    from,
    let: { a: `$${localField}` },
    pipeline: [
      {
        $match: {
          $expr: { $in: [`$${foreignField}`, '$$a'] },
        },
      },
      {
        $addFields: {
          sort: {
            $indexOfArray: ['$$a', `$${foreignField}`],
          },
        },
      },
      { $sort: { sort: 1 } },
      { $addFields: { sort: '$$REMOVE' } },
    ],
    as,
  },
});
