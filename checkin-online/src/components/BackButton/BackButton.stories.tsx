import React from 'react';
import {action} from '@storybook/addon-actions';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {BackButton} from './BackButton';

export default {
  component: BackButton,
  title: 'Base|Back Button',
  decorators: [withKnobs],
};

export const main = () => (
  <BackButton
    label={text('Label', 'Label')}
    onClick={action('Clicked')}
    disabled={boolean('Disabled', false)}
  />
);

export const disabled = () => (
  <BackButton
    label={text('Label', 'Label')}
    onClick={action('Clicked')}
    disabled={boolean('Disabled', true)}
  />
);
