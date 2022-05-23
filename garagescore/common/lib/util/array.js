module.exports = {
  /**
   * In computer programming,
   * the Schwartzian transform is technique used to improve the efficiency of sorting a list of items.
   * This idiom[1] is appropriate for comparison-based sorting
   * when the ordering is actually based on the ordering of a certain property (the key) of the elements,
   * where computing that property is an intensive operation that should be performed a minimal number of times.
   * For example, to sort the word list ("aaaa","a","aa") according to word length:
   * first build the list (["aaaa",4],["a",1],["aa",2]),
   * then sort it according to the numeric values getting (["a",1],["aa",2],["aaaa",4]),
   * then strip off the numbers
   * and you get ("a","aa","aaaa").
   **/
  sortBy(self, f) {
    /* eslint-disable no-param-reassign */
    // create pair [o, computed o.field]
    for (let i = self.length; i; ) {
      const o = self[--i];
      self[i] = [].concat(f.call(o, o, i), o);
    }
    // sort
    self.sort((a, b) => {
      for (let j = 0, len = a.length; j < len; ++j) {
        if (a[j] !== b[j]) return a[j] < b[j] ? -1 : 1;
      }
      return 0;
    });
    // remove field
    for (let k = self.length; k; ) {
      self[--k] = self[k][self[k].length - 1];
    }
    return self;
    /* eslint-enable no-param-reassign */
  },
};
