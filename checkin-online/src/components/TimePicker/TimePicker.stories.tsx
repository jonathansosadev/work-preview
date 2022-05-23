import React from 'react';
import {TimePicker, TIME_OPTIONS} from './TimePicker';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';

export default {
  component: TimePicker,
  title: 'Base/TimePicker',
  decorators: [withKnobs],
};

export const main = () => (
  <TimePicker
    onChange={action('selected')}
    label={text('Label', 'Label')}
    value={TIME_OPTIONS[0]}
    invalid={boolean('Invalid', false)}
    disabled={boolean('Disabled', false)}
  />
);

export const disabled = () => (
  <TimePicker
    onChange={action('selected')}
    label={text('Label', 'Label')}
    value={TIME_OPTIONS[0]}
    invalid={boolean('Invalid', false)}
    disabled={boolean('Disabled', true)}
  />
);

export const invalid = () => (
  <TimePicker
    onChange={action('selected')}
    label={text('Label', 'Label')}
    value={TIME_OPTIONS[0]}
    invalid={boolean('Invalid', true)}
    disabled={boolean('Disabled', false)}
    error={text('Error', 'Error')}
  />
);

export const empty = () => (
  <TimePicker
    onChange={action('selected')}
    label={text('Label', 'Label')}
    options={[]}
    value={null}
    invalid={boolean('Invalid', false)}
    disabled={boolean('Disabled', false)}
  />
);
