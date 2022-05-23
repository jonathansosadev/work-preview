import React from 'react';
import {Select} from './Select';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';

const story = {
  component: Select,
  title: 'Base/Dashboard/Select',
  decorators: [withKnobs],
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
];

export const main = () => (
  <Select
    onChange={action('selected')}
    label={text('Label', 'Label')}
    options={FAKE_OPTIONS}
    value={FAKE_OPTIONS[0]}
    invalid={boolean('Invalid', false)}
    disabled={boolean('Disabled', false)}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);

export const disabled = () => (
  <Select
    onChange={action('selected')}
    label={text('Label', 'Label')}
    options={FAKE_OPTIONS}
    value={FAKE_OPTIONS[0]}
    invalid={boolean('Invalid', false)}
    disabled={boolean('Disabled', true)}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);

export const invalid = () => (
  <Select
    onChange={action('selected')}
    label={text('Label', 'Label')}
    options={FAKE_OPTIONS}
    value={FAKE_OPTIONS[0]}
    invalid={boolean('Invalid', true)}
    disabled={boolean('Disabled', false)}
    error={text('Error', 'Error')}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);

export const empty = () => (
  <Select
    onChange={action('selected')}
    label={text('Label', 'Label')}
    options={[]}
    value={null}
    invalid={boolean('Invalid', false)}
    disabled={boolean('Disabled', false)}
    placeholder={text('Placeholder', 'Placeholder')}
  />
);

export default story;
