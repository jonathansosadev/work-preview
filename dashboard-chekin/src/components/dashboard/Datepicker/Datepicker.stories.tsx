import React from 'react';
import {Datepicker} from './Datepicker';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';

const story = {
  component: Datepicker,
  title: 'Base/Dashboard/Datepicker',
  decorators: [withKnobs],
};

export const main = () => (
  <Datepicker
    onChange={action('Changed')}
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', false)}
    error={text('Error', '')}
    defaultValues={{
      day: 20,
      month: {
        label: 'April',
        value: '04',
      },
      year: 2010,
    }}
  />
);

export const disabled = () => (
  <Datepicker
    onChange={action('Changed')}
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', true)}
    error={text('Error', '')}
  />
);

export const invalid = () => (
  <Datepicker
    onChange={action('Changed')}
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', false)}
    error={text('Error', 'Error')}
  />
);

export const empty = () => (
  <Datepicker
    onChange={action('Changed')}
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', false)}
    error={text('Error', '')}
  />
);

export default story;
