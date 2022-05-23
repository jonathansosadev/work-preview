import React from 'react';
import {HeadingSelect} from './HeadingSelect';
import {action} from '@storybook/addon-actions';

const story = {
  component: HeadingSelect,
  title: 'Base/Dashboard/Content Select',
};

const FAKE_OPTIONS = [
  {
    value: 'test',
    label: 'Option 1',
  },
  {
    value: 'test2',
    label: 'Option 2',
  },
  {
    value: 'test3',
    label: 'Option 3',
  },
  {
    value: 'test4',
    label: 'Option 4',
  },
  {
    value: 'test5',
    label: 'Option 5',
  },
  {
    value: 'test6',
    label: 'Option 6',
  },
];

export const main = () => (
  <HeadingSelect
    onChange={action('selected')}
    options={FAKE_OPTIONS}
    value={FAKE_OPTIONS[0]}
  />
);

export default story;
