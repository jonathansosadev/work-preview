import React from 'react';
import {boolean, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {MultiRadio} from './MultiRadio';

const story = {
  component: MultiRadio,
  title: 'Base/Dashboard/Checkbox',
  decorators: [withKnobs],
};

export const main = () => (
  <MultiRadio
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    options={[
      {label: 'Radio 1', value: 1},
      {label: 'Radio 2', value: 2},
    ]}
  />
);

export const checked = () => (
  <MultiRadio
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    options={[
      {label: 'Radio 1', value: 1},
      {label: 'Radio 2', value: 2},
    ]}
  />
);

export const disabled = () => (
  <MultiRadio
    onChange={action('Changed')}
    disabled={boolean('Disabled', true)}
    options={[
      {label: 'Radio 1', value: 1},
      {label: 'Radio 2', value: 2},
    ]}
  />
);

export default story;
