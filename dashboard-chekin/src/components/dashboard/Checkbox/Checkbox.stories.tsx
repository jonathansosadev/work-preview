import React from 'react';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {Checkbox} from './Checkbox';

const story = {
  component: Checkbox,
  title: 'Base/Dashboard/Checkbox',
  decorators: [withKnobs],
};

export const main = () => (
  <Checkbox
    onChange={action('Changed')}
    error={text('Error', 'Error')}
    disabled={boolean('Disabled', false)}
    checked={boolean('Checked', false)}
    label={text('Label', 'Label')}
  />
);

export const checked = () => (
  <Checkbox
    onChange={action('Changed')}
    disabled={boolean('Disabled', false)}
    checked={boolean('Checked', true)}
    label={text('Label', 'Label')}
    error={text('Error', 'Error')}
  />
);

export const disabled = () => (
  <Checkbox
    onChange={action('Changed')}
    disabled={boolean('Disabled', true)}
    checked={boolean('Checked', false)}
    label={text('Label', 'Label')}
    error={text('Error', 'Error')}
  />
);

export default story;
