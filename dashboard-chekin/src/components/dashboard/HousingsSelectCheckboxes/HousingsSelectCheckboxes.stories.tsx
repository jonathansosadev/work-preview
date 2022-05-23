import React from 'react';
import HousingsSelectCheckboxes from '.';

const MOCKED_HOUSINGS = [
  {label: 'awefaw', value: '7bf65d32228b42d6a3de1eafa09a37d2'},
  {label: 'faw', value: 'c8d94ce2069640c08622aba82b17a976'},
  {label: 'fawefwae', value: '832ef8fa576149f283f46db5b8df49c0'},
  {label: 'ffawefa', value: '30bd8f51c66949d0b9342b9eaba841be'},
  {label: 'gtrset', value: '278a68faa3214eb48c276cefd2f5cdf5'},
  {label: 'test1', value: '015761a386ef4bf1b960cd39d26edfc5'},
  {label: 'test1', value: 'e1ac9a74c52d47cb8766116731dac455'},
  {label: 'test1fe', value: '8420b706918742188db532c43a090585'},
];

const MOCKED_CHECKBOXES = {
  '7bf65d32228b42d6a3de1eafa09a37d2': false,
  c8d94ce2069640c08622aba82b17a976: true,
  '832ef8fa576149f283f46db5b8df49c0': false,
  '30bd8f51c66949d0b9342b9eaba841be': false,
  '278a68faa3214eb48c276cefd2f5cdf5': true,
  '015761a386ef4bf1b960cd39d26edfc5': false,
  e1ac9a74c52d47cb8766116731dac455: true,
  '8420b706918742188db532c43a090585': false,
};

const story = {
  component: HousingsSelectCheckboxes,
  title: 'Base/Dashboard/HousingsSelectCheckboxes',
};

export const Default = () => (
  <HousingsSelectCheckboxes
    allCheckboxLabel="Select all"
    housingsOptions={MOCKED_HOUSINGS}
    toggleIsChecked={() => {}}
    toggleSelectAll={() => {}}
    checkboxes={MOCKED_CHECKBOXES}
    isAllChecked={true}
  />
);

export default story;
