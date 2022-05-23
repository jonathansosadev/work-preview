import React from 'react';
import {action} from '@storybook/addon-actions';
import {withKnobs, text} from '@storybook/addon-knobs';
import {SubmitButton} from './SubmitButton';

export default {
  component: SubmitButton,
  title: 'Base|Submit Button',
  decorators: [withKnobs],
};

export const main = () => (
  <SubmitButton label={text('Label', 'Label')} onClick={action('Clicked')} />
);

export const mobile = () => (
  <SubmitButton label={text('Label', 'Label')} onClick={action('Clicked')} />
);
mobile.story = {
  parameters: {
    viewport: {defaultViewport: 'mobileM'},
  },
};
