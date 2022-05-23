/**
 * Generate a divide formula (no division by 0)
 * @param {string} [numerator]
 * @param {string} denominator
 * @param {number | null} [fallback=0] value to set if denominator is null (default to 0)
 * @returns {object} the computed formula
 * @example m_divide("$field1", "$field2") => {"$cond":[{"$eq":["$field2",0]},0,{"$divide":["$field1","$field2"]}]}
 */

const m_divide = (numerator, denominator, fallback = 0) => ({
  $cond: [{ $eq: [denominator, 0] }, fallback, { $divide: [numerator, denominator] }],
});

/**
 * Generate sum formula
 * @param {...string} [fields=]
 * @returns {object} the computed formula
 * @example m_sum("$field1", "$field2") => {"$sum":[[{"$ifNull":["$field1",0]},{"$ifNull":["$field2",0]}]]}
 */

const m_sum = (...fields) => {
  return {
    $sum: [
      fields.map((field) => {
        return { $ifNull: [field, 0] };
      }),
    ],
  };
};

module.exports = {
  m_divide,
  m_sum,
};
