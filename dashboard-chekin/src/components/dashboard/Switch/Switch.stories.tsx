import React from 'react';
import {Switch} from './Switch';
import {action} from '@storybook/addon-actions';
import {withKnobs, text, boolean} from '@storybook/addon-knobs';

const story = {
  component: Switch,
  title: 'Base/Dashboard/Switch',
  decorators: [withKnobs],
};

export const main = () => (
  <Switch
    checked={boolean('Checked', false)}
    onChange={action('selected')}
    label={text('Label', 'Label')}
    disabled={boolean('Disabled', false)}
  />
);

export const checked = () => (
  <Switch
    onChange={action('selected')}
    label={text('Label', 'Label')}
    checked={boolean('Checked', true)}
    disabled={boolean('Disabled', false)}
  />
);

export const disabled = () => (
  <Switch
    onChange={action('selected')}
    label={text('Label', 'Label')}
    checked={boolean('Checked', false)}
    disabled={boolean('Disabled', true)}
  />
);

export default story;
