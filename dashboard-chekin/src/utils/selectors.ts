export type Selector = {
  [key: string]: boolean;
};

export type SelectorItem = {
  [key: string]: string;
};

export function getInitSelectors(selectors: SelectorItem) {
  let result: Selector = {};
  Object.keys(selectors).forEach((key) => {
    result[key] = false;
  });

  return result;
}
